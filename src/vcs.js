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
    async clone(url, dir) {
        const config = {
            fs: this.fs,
            http: http,
            dir: dir,
            url: url,
            corsProxy: this.corsProxy
        };

        await git.clone(config);
        return await this.fs.promises.readdir(dir);
    }
    async readFile(path) {
        const file = await this.fs.promises.readFile(path);
        const textFile = new TextDecoder().decode(file);
        return await JSON.parse(textFile);
    }
}