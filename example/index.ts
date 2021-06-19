/**
 * 80000 点图例渲染
 */

const list: Array<{ v: number, color?: string }> = [];

for (let k = 0; k < 800000; k++)
    list.push({ v: Math.random() * 120 });

//设置图例
const legend = [
    { v: 10, color: `#0893f1` },
    { v: 20, color: `#0893f2` },
    { v: 30, color: `#0893f3` },
    { v: 40, color: `#0893f4` },
    { v: 50, color: `#0893f5` },
    { v: 60, color: `#0893f6` },
    { v: 70, color: `#0893f6` },
    { v: 80, color: `#0893f6` },
    { v: 90, color: `#0893f6` },
    { v: 100, color: `#0893f6` },
    { v: 110, color: `#0893f6` },
]

for (let seed = 1; seed < 10; seed++) {
    const len = legend.length
    const d0 = Date.now();
    //处理图例
    list.forEach((n: { v: number, color?: string }) => {
        for (let k = len - 1; k >= 0; k--) {
            if ((n.v - legend[k].v) >= 0) {
                n.color = legend[k].color;
                break;
            }
        }
    });
    const d1 = Date.now() - d0;
    console.log(`重复第${seed}次8万要素图例解析渲染耗时${d1}ms`);
}