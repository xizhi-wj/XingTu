import { defineStore } from 'pinia'

const appStore = defineStore('app', {
  state: (): AppState => ({
    name: '',
    version: '',
    log: []
  }),
  actions: {}
})

export default appStore
