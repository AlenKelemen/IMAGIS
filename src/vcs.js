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

  async add(dir, filepath) {
    return await git.add({ fs, dir: dir, filepath: filepath});
  }

  async commit(dir, name, message) {
    return await git.commit({
      fs,
      dir: dir,
      author: {
        name: name
      },
      message: message
    })
  }

  // Username and password missing
  async push(dir, username, password) {
    return await git.push({
      fs,
      http,
      dir: dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: username, password: password}),
    });
  }

  async fetch(url, dir) {
    return await git.fetch({
      fs,
      http,
      dir: dir,
      corsProxy: this.corsProxy,
      url: url,
      ref: 'main',
      depth: 1,
      singleBranch: true,
      tags: false
    });
  }

  async pull(dir) {
    return await git.pull({
      fs,
      http,
      corsProxy: this.corsProxy,
      dir: dir,
      ref: 'main',
      singleBranch: true
    })
  }
}
