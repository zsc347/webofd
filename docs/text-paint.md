# 文字对象渲染

此文档记录文字对象渲染的一些思考

文字对象规范位于 OFD 标准的 11.2 节

### 文字对象属性与 Canvas API 对应关系

-   Size: 字号, 大小为 mm

-   Stroke: 是否勾边

对应[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeText)

```
CanvasRenderingContext2D.strokeText(text, x, y [, maxWidth]);
```

-   Fill: 是否填充

```
CanvasRenderingContext2D.fillText(text, x, y [, maxWidth]);
```

-   HScale
    未发现直接对应 API，可能实现的方式为 paint 字形时先对 ctx 进行 scale

```
void ctx.scale(x, y);
```

-   ReadDirection & CharDirection
    阅读方向
    Canvas 有 direction 属性对应, 但是与这里的 ReadDirection 和 CharDirection 有不同的含义

具体在 TextCode 分析章节说明

```
ctx.direction = "ltr" || "rtl" || "inherit";
```

-   Weight
    设置字体粗细

-   Italic
    设置斜体样式

-   FillColor
    填充颜色

[API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle)

```
ctx.fillStyle = color;
ctx.fillStyle = gradient;
ctx.fillStyle = pattern;
```

-   StrokeColor

勾边颜色

[API strokeStyle] (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle)

```
ctx.strokeStyle = color;
ctx.strokeStyle = gradient;
ctx.strokeStyle = pattern;
```

-   CGTransform

TODO

-   TextCode

文字内容，指定一段字符编码串

### TextCode 对象分析

首先是 4 个属性

[X, Y] 决定第一个字形在 boundary box 里对应的位置

[DeltaX, DeltaY]共同决定下一个字形所在的位置

计算方式应当为

```
coordinate(i) = [X + sum(DeltaX(0...i-1)), Y + sum(DeltaX(0...j-1))]
```

DeltaX 或 DeltaY 不出现时，字形绘制点不做偏移

**CharDirection**

CharDirection 决定字形的的绘制方向

将每个字形理解为一张图片，CharDirection 相当于决定图片的旋转值

**ReadDirection**

决定文字的阅读方向

// TODO
字形定位可以由 X, Y, DeltaX, DeltaY 完成
字形旋转由 CharDirection 决定

那么 ReadDirection 在实际绘制过程中决定的是什么?

**TextCode 实例分析**

在测试文档中发现如下表示的 TextCode

```
<ofd:TextCode
    DeltaX="g 14 4.2333 g 2 2.1166 -63.4995 4.2333 2.1167 g 2 4.2333 2.1167 g 2 2.1166"
    DeltaY="g 16 0 4.2333 g 7 0" X="0" Y="3.6364">
保密保密保密开保密保密保密25保密1保密601密
</ofd:TextCode>
```

其中`DeltaX`包含了`g`,在规范文档中未找到具体的说明。

推测表明应当是指令式压缩描述，表明后面数字的重复次数
比如`g 14`应当是 `[14, ... , 14].length = 14`
