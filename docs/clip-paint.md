# OFD 裁剪区(Clip)绘制

裁剪区位于OFD规范的8.4章节

> 裁剪区由一组路径或文字构成，用于指定页面上的一个有效绘制区域，落在裁剪区以外的部分不受绘制指令的影响。
> 一个裁剪区可由多个分路径(Area)组成，最终的裁剪范围是各个分路径的并集。

> 裁剪区中的数据均想对于所修饰图元的外接矩形。

简单来说，裁剪区是在页面上扣出一块区域在绘制。绘制内容超出绘制区域的会被忽略。


对应的[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip) 是

```
void ctx.clip();
void ctx.clip(fillRule);
void ctx.clip(path, fillRule);
```

值得了解的是fill rule的默认的非零环绕原则，用于判断一个点是在路径内还是在路径外。
一个长方形显然是长方形内部的点都在裁剪区内，而一个镂空的形状就需要一个确定的规则来判断那些点是在路径内。


### OFD Clip示例

```
<ofd:Clips TransFlag="false">
    <ofd:Clip>
        <ofd:Area>
            <ofd:Path Boundary="0 0 71.4112 8.4642" Fill="true" Stroke="false">
                ofd:AbbreviatedData>M 0 0 L 71.4112 0 L 71.4112 8.4642 L 0 8.4642 C 
                </ofd:AbbreviatedData>
            </ofd:Path>
        </ofd:Area>
    </ofd:Clip>
</ofd:Clips>
```