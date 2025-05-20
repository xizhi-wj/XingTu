export const IMAGE_TYPE = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'tiff', 'svg', 'ico']
export const DEVICE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'cuda', label: 'CUDA' },
  { value: 'mps', label: 'MPS' },
  { value: 'cpu', label: 'CPU' }
]
export const MODEL_OPTIONS = [
  { label: 'RealESRGAN_RealESRGAN_x4plus_4x', value: 'RealESRGAN_RealESRGAN_x4plus_4x.pth' },
  {
    label: 'RealESRGAN_RealESRGAN_x4plus_anime_6B_4x',
    value: 'RealESRGAN_RealESRGAN_x4plus_anime_6B_4x.pth'
  },
  { label: 'RealESRGAN_RealESRGAN_x2plus_2x', value: 'RealESRGAN_RealESRGAN_x2plus_2x.pth' },
  { label: 'RealESRGAN_realesr_animevideov3_4x', value: 'RealESRGAN_realesr_animevideov3_4x.pth' },
  {
    label: 'RealESRGAN_AnimeJaNai_HD_V3_Compact_2x',
    value: 'RealESRGAN_AnimeJaNai_HD_V3_Compact_2x.pth'
  },
  { label: 'RealESRGAN_AniScale_2_Compact_2x', value: 'RealESRGAN_AniScale_2_Compact_2x.pth' },
  { label: 'RealESRGAN_Ani4Kv2_Compact_2x', value: 'RealESRGAN_Ani4Kv2_Compact_2x.pth' },
  {
    label: 'RealESRGAN_APISR_RRDB_GAN_generator_2x',
    value: 'RealESRGAN_APISR_RRDB_GAN_generator_2x.pth'
  },
  {
    label: 'RealESRGAN_APISR_RRDB_GAN_generator_4x',
    value: 'RealESRGAN_APISR_RRDB_GAN_generator_4x.pth'
  },
  { label: 'DAT_S_2x', value: 'DAT_S_2x.pth' },
  { label: 'DAT_S_3x', value: 'DAT_S_3x.pth' },
  { label: 'DAT_S_4x', value: 'DAT_S_4x.pth' },
  { label: 'DAT_2x', value: 'DAT_2x.pth' },
  { label: 'DAT_3x', value: 'DAT_3x.pth' },
  { label: 'DAT_4x', value: 'DAT_4x.pth' },
  { label: 'DAT_2_2x', value: 'DAT_2_2x.pth' },
  { label: 'DAT_2_3x', value: 'DAT_2_3x.pth' },
  { label: 'DAT_2_4x', value: 'DAT_2_4x.pth' },
  { label: 'DAT_light_2x', value: 'DAT_light_2x.pth' },
  { label: 'DAT_light_3x', value: 'DAT_light_3x.pth' },
  { label: 'DAT_light_4x', value: 'DAT_light_4x.pth' },
  { label: 'DAT_APISR_GAN_generator_4x', value: 'DAT_APISR_GAN_generator_4x.pth' },
  { label: 'HAT_S_2x', value: 'HAT_S_2x.pth' },
  { label: 'HAT_S_3x', value: 'HAT_S_3x.pth' },
  { label: 'HAT_S_4x', value: 'HAT_S_4x.pth' },
  { label: 'HAT_2x', value: 'HAT_2x.pth' },
  { label: 'HAT_3x', value: 'HAT_3x.pth' },
  { label: 'HAT_4x', value: 'HAT_4x.pth' },
  { label: 'HAT_Real_GAN_sharper_4x', value: 'HAT_Real_GAN_sharper_4x.pth' },
  { label: 'HAT_Real_GAN_4x', value: 'HAT_Real_GAN_4x.pth' },
  { label: 'HAT_ImageNet_pretrain_2x', value: 'HAT_ImageNet_pretrain_2x.pth' },
  { label: 'HAT_ImageNet_pretrain_3x', value: 'HAT_ImageNet_pretrain_3x.pth' },
  { label: 'HAT_ImageNet_pretrain_4x', value: 'HAT_ImageNet_pretrain_4x.pth' },
  { label: 'HAT_L_ImageNet_pretrain_2x', value: 'HAT_L_ImageNet_pretrain_2x.pth' },
  { label: 'HAT_L_ImageNet_pretrain_3x', value: 'HAT_L_ImageNet_pretrain_3x.pth' },
  { label: 'HAT_L_ImageNet_pretrain_4x', value: 'HAT_L_ImageNet_pretrain_4x.pth' },
  { label: 'RealCUGAN_Conservative_2x', value: 'RealCUGAN_Conservative_2x.pth' },
  { label: 'RealCUGAN_Denoise1x_2x', value: 'RealCUGAN_Denoise1x_2x.pth' },
  { label: 'RealCUGAN_Denoise2x_2x', value: 'RealCUGAN_Denoise2x_2x.pth' },
  { label: 'RealCUGAN_Denoise3x_2x', value: 'RealCUGAN_Denoise3x_2x.pth' },
  { label: 'RealCUGAN_No_Denoise_2x', value: 'RealCUGAN_No_Denoise_2x.pth' },
  { label: 'RealCUGAN_Conservative_3x', value: 'RealCUGAN_Conservative_3x.pth' },
  { label: 'RealCUGAN_Denoise3x_3x', value: 'RealCUGAN_Denoise3x_3x.pth' },
  { label: 'RealCUGAN_No_Denoise_3x', value: 'RealCUGAN_No_Denoise_3x.pth' },
  { label: 'RealCUGAN_Conservative_4x', value: 'RealCUGAN_Conservative_4x.pth' },
  { label: 'RealCUGAN_Denoise3x_4x', value: 'RealCUGAN_Denoise3x_4x.pth' },
  { label: 'RealCUGAN_No_Denoise_4x', value: 'RealCUGAN_No_Denoise_4x.pth' },
  { label: 'RealCUGAN_Pro_Conservative_2x', value: 'RealCUGAN_Pro_Conservative_2x.pth' },
  { label: 'RealCUGAN_Pro_Denoise3x_2x', value: 'RealCUGAN_Pro_Denoise3x_2x.pth' },
  { label: 'RealCUGAN_Pro_No_Denoise_2x', value: 'RealCUGAN_Pro_No_Denoise_2x.pth' },
  { label: 'RealCUGAN_Pro_Conservative_3x', value: 'RealCUGAN_Pro_Conservative_3x.pth' },
  { label: 'RealCUGAN_Pro_Denoise3x_3x', value: 'RealCUGAN_Pro_Denoise3x_3x.pth' },
  { label: 'RealCUGAN_Pro_No_Denoise_3x', value: 'RealCUGAN_Pro_No_Denoise_3x.pth' },
  { label: 'EDSR_Mx2_f64b16_DIV2K_official_2x', value: 'EDSR_Mx2_f64b16_DIV2K_official_2x.pth' },
  { label: 'EDSR_Mx3_f64b16_DIV2K_official_3x', value: 'EDSR_Mx3_f64b16_DIV2K_official_3x.pth' },
  { label: 'EDSR_Mx4_f64b16_DIV2K_official_4x', value: 'EDSR_Mx4_f64b16_DIV2K_official_4x.pth' },
  {
    label: 'SwinIR_classicalSR_DF2K_s64w8_SwinIR_M_2x',
    value: 'SwinIR_classicalSR_DF2K_s64w8_SwinIR_M_2x.pth'
  },
  {
    label: 'SwinIR_lightweightSR_DIV2K_s64w8_SwinIR_S_2x',
    value: 'SwinIR_lightweightSR_DIV2K_s64w8_SwinIR_S_2x.pth'
  },
  {
    label: 'SwinIR_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR_L_GAN_4x',
    value: 'SwinIR_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR_L_GAN_4x.pth'
  },
  {
    label: 'SwinIR_realSR_BSRGAN_DFO_s64w8_SwinIR_M_GAN_2x',
    value: 'SwinIR_realSR_BSRGAN_DFO_s64w8_SwinIR_M_GAN_2x.pth'
  },
  {
    label: 'SwinIR_realSR_BSRGAN_DFO_s64w8_SwinIR_M_GAN_4x',
    value: 'SwinIR_realSR_BSRGAN_DFO_s64w8_SwinIR_M_GAN_4x.pth'
  },
  {
    label: 'SwinIR_Bubble_AnimeScale_SwinIR_Small_v1_2x',
    value: 'SwinIR_Bubble_AnimeScale_SwinIR_Small_v1_2x.pth'
  },
  { label: 'SCUNet_color_50_1x', value: 'SCUNet_color_50_1x.pth' },
  { label: 'SCUNet_color_real_psnr_1x', value: 'SCUNet_color_real_psnr_1x.pth' },
  { label: 'SCUNet_color_real_gan_1x', value: 'SCUNet_color_real_gan_1x.pth' },
  { label: 'SRCNN_2x', value: 'SRCNN_2x.pth' },
  { label: 'SRCNN_3x', value: 'SRCNN_3x.pth' },
  { label: 'SRCNN_4x', value: 'SRCNN_4x.pth' }
]
