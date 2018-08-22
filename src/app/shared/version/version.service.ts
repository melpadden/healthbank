import { Injectable } from '@angular/core';


/**
 * Version service to query information about currently running service.
 */
@Injectable()
export class VersionService {
  getVersion(): string {
    return extractMeta('version', '0.0~dev');
  }

  getBuild(): string {
    return extractMeta('build', '??');
  }

  getHash(): string {
    return extractMeta('commit', '###');
  }

  /**
   * Returns all version information formatted.
   */
  getFormattedFull(): string {
    let versionString: string = this.getVersion();

    if (this.getBuild() !== '??') {
      versionString += ' - Build ' + this.getBuild();
    }

    if (this.getHash() !== '###') {
      versionString += `(${this.getBuild()})`;
    }

    return versionString;
  }
}


function extractMeta(name: string, devValue: string) {
  const versionEl: Element = document.querySelector(`meta[name="${name}"]`);
  if (!versionEl) {
    return '';
  }

  const version: string = versionEl.getAttribute('content');
  if (isMavenVariable(version)) {
    return devValue;
  }
  return version;
}


/**
 * Checks if the string is actually a maven variable, which hase the form "@SOME_VAR@"
 */
function isMavenVariable(str: string): boolean {
  let cnt = 0;

  for (const c of str) {
    if (c === '@') {
      cnt++;
      if (cnt >= 2) {
        return true;
      }
    }
  }

  return false;
}
