#!/usr/bin/env python3
"""Configure this skill locally. No cleanup; Mole install is explicit and optional."""
import argparse
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--android-project', action='append', help='Android Gradle root; repeat for each project')
    parser.add_argument('--preferred-avd', help='Name of an existing emulator to retain')
    parser.add_argument('--config-dir', type=Path, help='Override local profile directory')
    parser.add_argument('--install-mole', action='store_true', help='Install missing Mole using existing Homebrew')
    parser.add_argument('--dry-run', action='store_true', help='Preview only; no writes or installs')
    args = parser.parse_args()
    if platform.system() != 'Darwin':
        parser.error('This skill is for macOS')
    config_home = Path(os.environ.get('XDG_CONFIG_HOME') or Path.home() / '.config')
    directory = (args.config_dir or config_home / 'mac-space-cleanup').expanduser().resolve()
    if any(part in ('Mobile Documents', 'com~apple~CloudDocs') for part in directory.parts):
        parser.error('Keep the profile outside iCloud')
    path = directory / 'profile.json'
    try:
        profile = json.loads(path.read_text()) if path.exists() else {}
    except (OSError, ValueError) as error:
        parser.error(f'Cannot read existing profile: {error}')
    if not isinstance(profile, dict):
        parser.error('Existing profile must be a JSON object')
    if args.android_project is not None:
        roots = []
        for value in args.android_project:
            root = Path(value).expanduser().resolve()
            if not any((root / name).is_file() for name in ('settings.gradle', 'settings.gradle.kts')):
                parser.error(f'Not an Android Gradle project root: {root}')
            if str(root) not in roots:
                roots.append(str(root))
        profile['android_projects'] = roots
    else:
        profile.setdefault('android_projects', [])
    if args.preferred_avd is not None:
        name = args.preferred_avd
        if not name or '/' in name or '\\' in name or name in ('.', '..'):
            parser.error('Invalid AVD name')
        avd_home = Path(os.environ.get('ANDROID_AVD_HOME') or Path.home() / '.android/avd').expanduser()
        if not (avd_home / f'{name}.ini').is_file():
            parser.error(f'Emulator registration not found: {name}')
        profile['preferred_avd'] = name
    tools = {name: shutil.which(name) for name in ('mo', 'mole', 'brew', 'docker', 'yarn', 'uv', 'ollama')}
    install = args.install_mole and not (tools['mo'] or tools['mole'])
    if install and not tools['brew']:
        parser.error('Homebrew is missing; install Mole manually or use native cleanup tools')
    if install and not args.dry_run:
        subprocess.run([tools['brew'], 'install', 'mole'], check=True)
        tools['mo'] = shutil.which('mo')
        tools['mole'] = shutil.which('mole')
    changed = not path.exists() or json.loads(path.read_text()) != profile
    if changed and not args.dry_run:
        directory.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(prefix='.profile-', dir=directory)
        try:
            with os.fdopen(fd, 'w') as stream:
                stream.write(json.dumps(profile, indent=2) + '\n')
            os.replace(temp_name, path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
    print(json.dumps({'dry_run': args.dry_run, 'profile_path': str(path), 'profile_changed': changed,
                      'profile': profile, 'tools': tools,
                      'mole_install': bool(install), 'cleanup_performed': False}, indent=2))


if __name__ == '__main__':
    main()
