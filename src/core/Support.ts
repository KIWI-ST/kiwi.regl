import {
    CActiveTarget,
    CArraybufferTarget,
    CAttachmentTarget,
    CColorSpace,
    CComponent,
    CDimension,
    CMipmapHint,
    CPrimitive,
    CRenderbufferColor,
    CShaderTarget,
    CTextureColor,
    CTextureComponent,
    CTextureCompressed,
    CTextureFillTarget,
    CTextureMAGFilter,
    CTextureMapTarget,
    CTextureMINFilter,
    CUsage,
    CVector,
    CWebGLStatusFLAG,
    CWebGLStatusVariable
} from "./Constant";

type SArraybufferTarget = keyof {
    [key in keyof typeof CArraybufferTarget]: string
}

type SPrimitive = keyof {
    [key in keyof typeof CPrimitive]: string
}

type SComponent = keyof {
    [key in keyof typeof CComponent]: string
}

type SDimension = keyof {
    [key in keyof typeof CDimension]: string
}

type SUsage = keyof {
    [key in keyof typeof CUsage]: string
}

type SShaderTarget = keyof {
    [key in keyof typeof CShaderTarget]: string
}

type SActiveTarget = keyof {
    [key in keyof typeof CActiveTarget]: string
}

type SVector = keyof {
    [key in keyof typeof CVector]: string
}

type SAttachmentTarget = keyof {
    [key in keyof typeof CAttachmentTarget]: string
}

type STextureFillTarget = keyof {
    [key in keyof typeof CTextureFillTarget]: string
}

type STextureMapTarget = keyof {
    [key in keyof typeof CTextureMapTarget]: string
}

type STextureColor = keyof {
    [key in keyof typeof CTextureColor]: string
}

type SRenderbufferColor = keyof {
    [key in keyof typeof CRenderbufferColor]: string
}

type STextureComponent = keyof {
    [key in keyof typeof CTextureComponent]: string
}

type SColorSpace = keyof {
    [key in keyof typeof CColorSpace]: string
}

type STextureMAGFilter = keyof {
    [key in keyof typeof CTextureMAGFilter]: string
}

type STextureMINFilter = keyof {
    [key in keyof typeof CTextureMINFilter]: string
}

type STextureCompressed = keyof {
    [key in keyof typeof CTextureCompressed]: string
}

type SMipmapHint = keyof {
    [key in keyof typeof CMipmapHint]: string
}

type SWebGLStatusFLAG = keyof {
    [key in keyof typeof CWebGLStatusFLAG]: string
}

type SWebGLStatusVariable = keyof {
    [key in keyof typeof CWebGLStatusVariable]: string
}

type SWebGLStatus = { [key in keyof typeof CWebGLStatusFLAG]?: boolean } | { [key in keyof typeof CWebGLStatusVariable]?: any[] }

export {
    type SVector,
    type SPrimitive,
    type SUsage,
    type SDimension,
    type SComponent,
    type SColorSpace,
    type STextureColor,
    type SMipmapHint,
    type STextureCompressed,
    type SRenderbufferColor,
    type STextureComponent,
    type STextureMINFilter,
    type STextureMAGFilter,
    type SShaderTarget,
    type SActiveTarget,
    type STextureMapTarget,
    type SAttachmentTarget,
    type STextureFillTarget,
    type SArraybufferTarget,
    type SWebGLStatusFLAG,
    type SWebGLStatusVariable,
    type SWebGLStatus
}