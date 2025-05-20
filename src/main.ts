import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import router from './router'
import '@arco-design/web-vue/dist/arco.css'
import 'remixicon/fonts/remixicon.css'
import './assets/style.css'
import Button from './components/common/Button.vue'
import UploadButton from './components/common/UploadButton.vue'
import ToolDesc from './components/common/ToolDesc.vue'
import UploadArea from './components/common/UploadArea.vue'
import SelectPath from './components/common/SelectPath.vue'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(router)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(createPinia())
app.component<typeof Button>('xz-button', Button)
app.component<typeof UploadButton>('xz-upload-button', UploadButton)
app.component<typeof ToolDesc>('xz-tool-desc', ToolDesc)
app.component<typeof UploadArea>('xz-upload-area', UploadArea)
app.component<typeof SelectPath>('xz-select-path', SelectPath)

app.mount('#app')
