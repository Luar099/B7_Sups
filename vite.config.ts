import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  if (process.env.GITHUB_ACTIONS === "true") {
    const { default: react } = await import("@vitejs/plugin-react");
    const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
    return {
      base: repositoryName ? `/${repositoryName}/` : "/",
      plugins: [react()],
      build: {
        outDir: "dist/client",
        emptyOutDir: true,
      },
    };
  }

  return {
    plugins: [vinext()],
  };
});
