class Heading {
    constructor() {
        this.data = [];
        this.isTyping = false;
    }

    clearUnread(id) {
        for (const entry of this.data) {
            if (entry.fbid === id) {
                entry.unread = 0;
            }
        }
    }

    getFbid(nb) {
        if (this.data[nb])
            return this.data[nb].fbid;
        else return -1;
    }

    writeHeader(convoId) {
        let head = '';
        let first = true;
        const columns = process.stdout.columns;

        this.data.forEach((entry, i) => {
            if (entry.fbid === convoId) {
                return;
            }

            let textEntry = '';
            if (!first) {
                textEntry += ' - ';
            }
            textEntry += `[${i}] ${entry.name}${entry.unread > 0 ? '*' : ''}`;
            if (head.length + textEntry.length < columns) {
                if (entry.unread > 0) {
                    head += textEntry.bold;
                } else {
                    head += textEntry;
                }
            } else {
                return;
            }

            first = false;
        });

        for (let j = head.length; j < columns - 1; ++j) {
            head += ' ';
        }
        if (this.isTyping)
            console.log(head.bgBlue+' '.bgRed);
        else console.log((head+' ').bgBlue);
        
    }

}

module.exports = new Heading();
