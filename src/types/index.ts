interface AppState {
  log: string[]
  name: string
  version: string
}

interface ImageItem {
  id: string
  status: string
  url: string
  name: string
  size: number
  type: string
  raw: File
  output_path: string
  is_completed: boolean
  complete_status: 0 | 1 | 2
  path?: string
}

type XingTuCommand = 'compress' | 'format' | 'remove_bg' | 'final2x'

interface BaseConfig {
  input_path: string[]
  output_path: string
  task_id?: string
}

interface CompressConfig extends BaseConfig {
  target_format: string
  quality: number
}

interface FormatConfig extends BaseConfig {
  target_format: string
}

interface RemoveBgConfig extends BaseConfig {
  bg_color: string
  model: string
}

interface Final2xConfig extends BaseConfig {
  pretrained_model_name: string
  device: string
  gh_proxy?: string
  target_scale: number
  cc_model_scale?: number
}

interface XingTuConfig {
  command: XingTuCommand
  task_id?: string
  formatConfig?: FormatConfig
  compressConfig?: CompressConfig
  removeBgConfig?: RemoveBgConfig
  final2xConfig?: Final2xConfig
}

type ImageFormat = 'jpg' | 'png' | 'webp' | 'bmp' | 'tiff' | 'gif' | 'heic' | 'avif' | 'raw'

interface KouTuItem extends ImageItem {
  bg_color: string
  model: string
}

interface FormatItem extends ImageItem {
  format: ImageFormat
  quality?: number
}

interface Final2xItem extends ImageItem {
  target_url: string
  target_scale: number
  model: string
  target_name: string
}

interface CompressItem extends ImageItem {
  format: ImageFormat
  quality: number
}
