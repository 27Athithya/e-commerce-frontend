type ClassValue = string | number | false | null | undefined | ClassDictionary | ClassArray;

interface ClassDictionary {
  [key: string]: boolean | undefined | null;
}

interface ClassArray extends Array<ClassValue> {}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];

  const add = (value: ClassValue): void => {
    if (!value) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }

    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) {
        classes.push(key);
      }
    }
  };

  inputs.forEach(add);
  return classes.join(" ");
}