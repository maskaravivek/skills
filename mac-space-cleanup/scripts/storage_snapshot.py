#!/usr/bin/env python3
"""Read-only macOS storage snapshot; optional comparison to the same APFS container."""
import argparse
import datetime
import json
from pathlib import Path
import plistlib
import shutil
import subprocess


def run(argv, timeout=15):
    try:
        result = subprocess.run(argv, capture_output=True, timeout=timeout)
        return {
            'command': argv,
            'returncode': result.returncode,
            'stdout': result.stdout.decode('utf-8', errors='replace').strip(),
            'stderr': result.stderr.decode('utf-8', errors='replace').strip(),
        }
    except (OSError, subprocess.TimeoutExpired) as error:
        return {'command': argv, 'error': str(error)}


def parse_container(raw, data_info):
    if raw.get('returncode') != 0:
        return {'error': raw.get('error') or raw.get('stderr') or 'diskutil failed'}
    try:
        containers = plistlib.loads(raw['stdout'].encode())['Containers']
        if data_info.get('returncode') != 0:
            return {'error': data_info.get('error') or data_info.get('stderr') or 'Data-volume lookup failed'}
        info = plistlib.loads(data_info['stdout'].encode())
        device = info['DeviceIdentifier']
        matches = [container for container in containers if any(
            volume.get('DeviceIdentifier') == device
            for volume in container.get('Volumes', [])
        )]
        if len(matches) != 1:
            return {'error': 'Could not uniquely identify the boot Data-volume APFS container'}
        container = matches[0]
        capacity = container['CapacityCeiling']
        free = container['CapacityFree']
        return {
            'uuid': container['APFSContainerUUID'],
            'device': container['ContainerReference'],
            'capacity_bytes': capacity,
            'free_bytes': free,
            'used_bytes': capacity - free,
            'volumes': [{key: volume.get(key) for key in (
                'Name', 'DeviceIdentifier', 'MountPoint', 'Roles', 'CapacityInUse'
            )} for volume in container.get('Volumes', [])],
        }
    except (KeyError, ValueError, TypeError, plistlib.InvalidFileException) as error:
        return {'error': str(error)}


def compare(before, after):
    old = before.get('apfs', {})
    new = after.get('apfs', {})
    if not old.get('uuid') or old.get('uuid') != new.get('uuid'):
        return {'error': 'APFS container identity missing or changed; no recovery comparison'}
    if not isinstance(old.get('free_bytes'), int) or not isinstance(new.get('free_bytes'), int):
        return {'error': 'Free-space measurements unavailable'}
    delta = new['free_bytes'] - old['free_bytes']
    return {'net_recovered_bytes': delta, 'net_recovered_GB': delta / 10**9,
            'net_recovered_GiB': delta / 2**30}


def snapshot():
    data_info = run(['diskutil', 'info', '-plist', '/System/Volumes/Data'])
    raw = run(['diskutil', 'apfs', 'list', '-plist'])
    data = {'captured_at': datetime.datetime.now().astimezone().isoformat(),
            'home': str(Path.home()), 'apfs': parse_container(raw, data_info),
            'df': run(['df', '-h', '/System/Volumes/Data']),
            'swap': run(['sysctl', 'vm.swapusage']),
            'time_machine_snapshots': run(['tmutil', 'listlocalsnapshots', '/']),
            'data_snapshots': run(['diskutil', 'apfs', 'listSnapshots', '/System/Volumes/Data'])}
    if 'error' in data['apfs']:
        data['apfs_diagnostic'] = raw
        data['data_volume_diagnostic'] = data_info
    mole = shutil.which('mo') or shutil.which('mole')
    data['mole'] = run([mole, '--version']) if mole else {'available': False}
    # Context name only. The agent must verify the endpoint before any Docker mutation.
    docker = shutil.which('docker')
    data['docker_context'] = run([docker, 'context', 'show']) if docker else {'available': False}
    docker_disk = Path.home() / 'Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw'
    if docker_disk.exists():
        try:
            stat = docker_disk.stat()
            data['docker_raw'] = {'path': str(docker_disk), 'logical_bytes': stat.st_size,
                                  'allocated_bytes': stat.st_blocks * 512}
        except OSError as error:
            data['docker_raw'] = {'path': str(docker_disk), 'error': str(error)}
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, help='New output JSON path; never overwritten')
    parser.add_argument('--compare', type=Path, help='Earlier snapshot to compare')
    args = parser.parse_args()
    if args.output and args.output.exists():
        parser.error('Output already exists; choose a fresh path')
    before = json.loads(args.compare.read_text()) if args.compare else None
    result = snapshot()
    if before is not None:
        result['comparison'] = compare(before, result)
    encoded = json.dumps(result, indent=2) + '\n'
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with args.output.open('x') as stream:
            stream.write(encoded)
    print(encoded, end='')


if __name__ == '__main__':
    main()
