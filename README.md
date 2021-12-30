# pipegl
👑 Functional WebGL

> Rewritten regl completed in typescript, and helps you quickly implement rendering logic by providing smarter tips !

## Example/DOC ##

### Basic ###

> [Basic-Instances](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.instances.ts)
<img width="257" alt="1640271054(1)" src="https://user-images.githubusercontent.com/5127112/147443605-3a67e8ad-e022-475d-ae63-b1499bfc06ed.png"> 

> [Basic-Cube](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.cube.ts)
<img width="257" alt="1640271054(1)" src="https://user-images.githubusercontent.com/5127112/147256602-778aef86-147d-4b91-81db-f7acf71a1054.png"> 

> [Basic-Cubemap-Reflect](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.cubemap.reflect.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147257072-acee3507-c014-4901-8ac1-1b9be2fc2694.png">

> [Basic-Cubemap-Skybox](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.cubemap.skybox.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147257637-7d0b5825-a7b7-4a55-9597-abda53d6cf0a.jpg">

> [Basic-Elements](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.elements.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147257949-3c502ddf-d597-4ab2-852f-d3b863f740ca.png">

> [Basic-Fbo](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.fbo.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147258301-bae84a7c-068c-4186-b425-36b06d3998eb.png">

> [Basic-Mipmap](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.mipmap.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147258370-c58709ce-eb97-4a16-8f17-c42f4f75735b.png">

> [Basic-Triangle](https://github.com/KIWI-ST/pipegl/blob/master/example/basic/benchmark.triangle.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147258427-8ad4a6ae-088e-4d2d-bd1a-fd3d4d8c0aed.png">

### Batch ###

> [Batch-Attribute](https://github.com/KIWI-ST/pipegl/blob/master/example/batch/benchmark.attribute.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147259352-b172d45e-4dc3-42f0-9d46-b99be1d8e859.png">

> [Batch-Texture](https://github.com/KIWI-ST/pipegl/blob/master/example/batch/benchmark.texture.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147259472-2803d751-ece8-419c-98e3-ca955707f550.png">

> [Batch-Uniform](https://github.com/KIWI-ST/pipegl/blob/master/example/batch/benchmark.uniform.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147259560-cf08ee02-11bf-4d93-8293-eb229a1431d0.png">

### Light ###

> [Light-Color](https://github.com/KIWI-ST/pipegl/blob/master/example/light/benchmark.light.color.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147429700-c04347e9-3b6a-45d0-9bff-8be6c168aa7e.png">

> [Light-Shadow](https://github.com/KIWI-ST/pipegl/blob/master/example/light/benchmark.light.shadow.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147485068-6866e58a-366a-4bf6-ac92-0fcc11bde887.png">

### Rendering Tech ###
>[PBR](https://github.com/KIWI-ST/pipegl/blob/master/example/tech/benchmark.pbr.ts)
<img width="256" alt="7f9d2c0bca317cf2e836d13ed85762f" src="https://user-images.githubusercontent.com/5127112/147713802-495d50dd-df3f-42ac-8596-b7236089d227.png">

## Modules ##

### compiler ###
- [x] CompilerCore
- [x] emitAttribute
- [x] emitBatch
- [x] emitElement
- [x] emitFramebuffer
- [x] emitProgram
- [x] emitStatus
- [x] emitUniform
- [x] parseAttribute
- [x] parseConfigure
- [x] parseElement
- [x] parseProgram
- [x] parseStatus
- [x] parseUniform
- [x] parseFramebuffer

### core ###
- [x] Constant
- [x] Dispose
- [x] Extension
- [x] Format
- [x] Limit
- [x] Props
- [x] Status
- [x] Support
- [x] Transpose
- [x] Pipe

### pool ###
- [x] BufferPool
- [x] MipmapPool
- [x] TexImagePool

### res ###
- [x] GAttachment
- [x] GBuffer
- [x] GElementbuffer
- [x] GFramebuffer
- [x] GProgram
- [x] GRenderbuffer
- [x] GShader
- [x] GTexture
- [x] GVertexArrayObject

### state ###
- [x] BufferState
- [x] ElementState
- [x] StringState
- [x] ShaderState
- [x] ProgramState
- [x] TextureState
- [x] AttributeState
- [x] RenderbufferState
- [x] FramebufferState

### utils ###
- [x] check
- [x] checkAttribute
- [x] checkTexutre
- [x] defaultValue
- [x] detectComponent
- [x] getFlatten
- [x] getIdx
- [x] isTypedArray
- [x] toHalfFloat
- [x] createTexFlag
- [x] createPerformance
- [x] createStats
- [x] isNDArray
- [x] checkTexture
- [x] getExtendCopy
- [x] getPixelSize
- [x] isPowerOf2
- [x] isBufferArray
- [x] isFunction
