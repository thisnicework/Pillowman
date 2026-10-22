import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 빌드마다 고유한 버전 ID (배포 감지용)
const BUILD_ID = String(Date.now());

// 빌드 결과물에 /version.json 을 함께 생성하는 플러그인
function versionFilePlugin() {
  return {
    name: 'pillowman-version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: BUILD_ID }),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), versionFilePlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_ID),
  },
  server: {
    port: 3000,
    open: false
  }
});
