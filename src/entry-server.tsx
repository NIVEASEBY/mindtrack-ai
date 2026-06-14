import { createStartHandler, defaultRenderHandler } from '@tanstack/start/server'
import { createRouter } from './router'

export default createStartHandler({
  createRouter,
  getRouterContext: () => ({
    // You can pass global context here
  }),
})(defaultRenderHandler)