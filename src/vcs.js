import regeneratorRuntime from "regenerator-runtime";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import fs from "@isomorphic-git/lightning-fs";

export default class VersionControl {
  constructor(path) {
    this.fs = new fs(path);
    this.corsProxy = "https://cors.isomorphic-git.org";
  }
  async clone(url, dir) {
    const config = {
      fs: this.fs,
      http: http,
      dir: dir,
      url: url,
      corsProxy: this.corsProxy,
      username: "EDC-dev",
      password: "MapGuide6.5",
    };
    await git.clone(config);
    return await this.fs.promises.readdir(dir);
  }
  async readFile(path) {
    const file = await this.fs.promises.readFile(path);
    const textFile = new TextDecoder().decode(file);
    return await JSON.parse(textFile);
  }
  async status(dir, filepath) {
    const fileInfo = {
      fs: this.fs,
      dir: dir,
      filepath: filepath,
    };
    return await git.status(fileInfo);
  }
}
