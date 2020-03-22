class Roles {
    // Value :
    // 0 : Empty
    // 1 : Rope
    // 2 : Big Ben
    constructor(good, bad) {
        this.roles = [];
        for (let i = 0; i < good; i++) {
            this.roles.push(0);
        }
        for (let i = 0; i < bad; i++) {
            this.roles.push(1);
        }
        this.shuffle(this.roles);

        console.log("List of role : ", this.roles);
        return this.roles;
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
module.exports = Roles
