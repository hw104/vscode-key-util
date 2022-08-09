export interface Keybinding {
  key: string;
  command: string;
  when: string | undefined;
}

export class KeyInfo {
  constructor(public readonly steps: KeyCombi[]) {}

  static fromKeybinding(src: Keybinding): KeyInfo {
    return new KeyInfo(src.key.split(" ").map(KeyCombi.fromString));
  }

  public toString(): string {
    return this.steps.map((c) => c.toString()).join(" ");
  }

  public compare(other: KeyInfo): number {
    const thisSize = this.steps.length;
    const otherSize = other.steps.length;

    if (thisSize !== otherSize) {
      return thisSize - otherSize;
    }

    for (let i = 0; i < this.steps.length; i++) {
      const thisCombi = this.steps[i];
      const otherCombi = other.steps[i];
      const compare = thisCombi.compare(otherCombi);
      if (compare !== 0) {
        return compare;
      }
    }

    return 0;
  }

  public replace(srcKey: string, distKey: string): KeyInfo {
    return new KeyInfo(
      this.steps.map(
        (s) =>
          new KeyCombi(
            s.keys.map((k) => new Key(k.is(srcKey) ? distKey : k.src))
          )
      )
    );
  }
}

class KeyCombi {
  constructor(public readonly keys: Key[]) {}

  public static fromString(src: string): KeyCombi {
    return new KeyCombi(src.split("+").map((p) => new Key(p)));
  }

  toString(): string {
    return this.keys.map((key) => key.src).join("+");
  }

  public compare(other: KeyCombi): number {
    const thisSize = this.keys.length;
    const otherSize = other.keys.length;
    if (thisSize !== otherSize) {
      return thisSize - otherSize;
    }

    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i];
      const o = other.keys[i];
      const c = k.compare(o);
      if (c !== 0) {
        return c;
      }
    }

    return 0;
  }
}

class Key {
  public readonly modifier: boolean;
  static modiKeys = ["ctrl", "shift", "alt", "cmd", "esc", "super", "meta"];
  constructor(public readonly src: string) {
    this.modifier = Key.modiKeys.includes(src);
  }

  compare(other: Key): number {
    if (this.modifier) {
      if (other.modifier) {
        return Key.modiKeys.indexOf(this.src) - Key.modiKeys.indexOf(other.src);
      }
      return -1;
    }
    if (other.modifier) {
      return 1;
    }
    return this.src.localeCompare(other.src);
  }

  is(keyString: string): boolean {
    return this.src === keyString;
  }
}

export function isSame(a: Keybinding, b: Keybinding): boolean {
  return a.key === b.key && a.command === b.command && a.when === b.when;
}

/* import * as fs from "fs";
function main() {
  const path = process.argv[2];
  const keybindings = (
    JSON.parse(fs.readFileSync(path).toString()) as Keybinding[]
  ).map((e) => new KeyInfo(e));
  const sorted = keybindings.sort((a, b) => a.compare(b)).map((e) => e.src);
  console.log(JSON.stringify(sorted, null, 2));
}
main();
 */
