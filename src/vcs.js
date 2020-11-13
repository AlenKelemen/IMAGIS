
import regeneratorRuntime from "regenerator-runtime";
import git from "isomorphic-git"
import http from "isomorphic-git/http/web"
import fs from "@isomorphic-git/lightning-fs";
//vc.getFile("https://github.com/AlenKelemen/test-json.git", "/test-json",'db.json')

export default class VersionControl {
  constructor(path) {
    this.fs = new fs(path)
    this.corsProxy = "https://cors.isomorphic-git.org";
  }
  async getFile(url, dir,db) {
    const config =  {
      fs: this.fs,
      http: http,
      dir: dir,
      url: url,
      corsProxy: this.corsProxy
    };

    await git.clone(config);
    const dbFile = await this.fs.promises.readFile(dir + '/' + db);
    const geoJSONString = new TextDecoder().decode(dbFile);
    return JSON.parse(geoJSONString);
  }

  // TODO
  async updateFile(url, dir) {
    await git.add({ fs, dir, filepath: '.' })
    await git.commit({ fs, dir, author: commit.author, message: commit.message })
    await git.push({
      http,
      fs,
      dir,
      onAuth: () => ({
        oauth2format: 'github',
        token: process.env.GITHUB_TOKEN,
      }),
    })
}

}