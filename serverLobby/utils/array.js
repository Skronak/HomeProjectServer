class Array {
    removeIfExists(array, newItem) {
        var index = array.findIndex(newItem);

        if (index === -1){
            array.push(newItem);
        }
        return array;
    }
}

module.exports = Array
