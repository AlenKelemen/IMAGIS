const m = new Map();
            for (const item of src.getFeatures()) {
              if (!m.has(item.get(property))) {
                m.set(item.get(property), true);
                result.push(item.get(property));
              }
            }
            console.log(result);
            const num = result
              .filter((x) => typeof x === "number")
              .sort((a, b) => {
                return a - b;
              });
            const str = result.filter((x) => typeof x !== "number").sort();
            for (const r  of num) {
              distinct.appendChild(elt("div", {}, r.toString()));
            }
            for (const r of str) {
              distinct.appendChild(elt("div", {}, r || '< >'));
            }