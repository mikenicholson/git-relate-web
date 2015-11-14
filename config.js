/**
 Simple config for development purposes.
 */
var config = {
    data_dir: "./data",
    repo_url: "git@github.com:themikenicholson/git-relate-web.git",
    authOpts : {
        // Set these options for cloning a repo over SSH
        publicKeyPath: process.env.HOME + "/.ssh/id_rsa.pub",
        privateKeyPath: process.env.HOME + "/.ssh/id_rsa",
        passphrase: "",
    },
    fetchIntervalMinutes: 5
};

module.exports = config
