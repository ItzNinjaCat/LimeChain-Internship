// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0; 
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";

library BookMap{
    struct Book{
        string name;
        uint8 availableCopies;
        address[] previouslyTaken;
    }

    struct Map {
        uint8[] keys;
        mapping(uint8 => Book) books;
        mapping(uint8 => uint8) indexOf;
        mapping(uint8 => bool) inserted;
    }

    function get(Map storage map, uint8 key) internal view returns (Book storage) {
        return map.books[key];
    }

    function getKeyAtIndex(Map storage map, uint8 index) internal view returns (uint8) {
        return map.keys[index];
    }

    function size(Map storage map) internal view returns (uint8) {
        return uint8(map.keys.length);
    }

    function set(
        Map storage map,
        uint8 key,
        Book memory _book
    ) internal {
        if (map.inserted[key]) {
            map.books[key].availableCopies++;
        } else {
            map.inserted[key] = true;
            map.books[key] = _book;
            map.indexOf[key] = uint8(map.keys.length);
            map.keys.push(key);
        }
    }

    function remove(Map storage map, uint8 key) internal {
        if (!map.inserted[key]) {
            return;
        }

        delete map.inserted[key];
        delete map.books[key];

        uint8 index = map.indexOf[key];
        uint8 lastIndex = uint8(map.keys.length) - 1;
        uint8 lastKey = map.keys[lastIndex];

        map.indexOf[lastKey] = index;
        delete map.indexOf[key];

        map.keys[index] = lastKey;
        map.keys.pop();
    }
}

contract Library is Ownable{
    using BookMap for BookMap.Map;

    event addBookEvent(uint8 id, BookMap.Book book);
    event borrowBookEvent(address indexed takenBy, uint8 id, BookMap.Book book);
    event returnBookEvent(address indexed returnedBy, uint8 id, BookMap.Book book);

    modifier BookExists(uint8 _id) {
        require(libraryMap.inserted[_id], "This book is not available");
        _;
    }
    BookMap.Map private libraryMap;

    uint public immutable takingFee;
    
    mapping(uint8 => mapping(address => bool)) private currentlyTakenBooks;

    uint8[] private availableIds;
    mapping(uint8 => uint8) private availableIndexMap;
    mapping(uint8 => bool) private availableInsertedMap;

    constructor(uint _fee) {
        takingFee = _fee;
    }

    receive() external payable {}

    function addAvailableBook(uint8 _id) private {
        if(!availableInsertedMap[_id]){
            availableInsertedMap[_id] = true;
            availableIndexMap[_id] = uint8(availableIds.length);
            availableIds.push(_id);
        }
    }

    function removeAvailableBook(uint8 _id) private {
        if (!availableInsertedMap[_id]) {
            return;
        }

        uint8 index = availableIndexMap[_id];
        uint8 lastIndex = uint8(availableIds.length) - 1;
        uint8 lastId = availableIds[lastIndex];
        availableIds[index] = availableIds[lastIndex];
        availableIds.pop();
        availableIndexMap[lastId] = index;

        delete availableIndexMap[_id];
        delete availableInsertedMap[_id];
    }

    function getBalance() external view onlyOwner returns (uint){
        return address(this).balance;
    }

    function withdraw() external onlyOwner{
        require(address(this).balance > 0, "No fees to be withdrawn");
        bool success = payable(msg.sender).send(address(this).balance);
        require(success, "send failed");
    }

    function addBook(string calldata _name) external onlyOwner{
        uint8 id = uint8(uint(keccak256(abi.encodePacked((_name))))) % 100 + 1;
        BookMap.Book memory book;
        book.name = _name;
        book.availableCopies = 1;
        libraryMap.set(id, book);
        addAvailableBook(id);
        emit addBookEvent(id, book);
    }

    function takeBook(uint8 _id) external payable BookExists(_id){
        BookMap.Book storage book = libraryMap.get(_id);
        require(book.availableCopies > 0, "Book is not currently not available");
        require(!currentlyTakenBooks[_id][msg.sender]  , "User has already borrowed a copy of this book");
        require(msg.value >= takingFee, "Not enough ether to borrow book");

        if(msg.value > takingFee){
            bool success = payable(msg.sender).send(msg.value - takingFee);
            require(success, "send failed");
        }

        book.previouslyTaken.push(msg.sender);
        currentlyTakenBooks[_id][msg.sender] = true;
        if(--book.availableCopies == 0){
            removeAvailableBook(_id);
        }

        emit borrowBookEvent(msg.sender, _id, book);
    }

    function returnBook(uint8 _id) external BookExists(_id){
        require(currentlyTakenBooks[_id][msg.sender], "User has not borrowed this book");
        BookMap.Book storage book = libraryMap.get(_id);
        book.availableCopies++;
        delete currentlyTakenBooks[_id][msg.sender];
        addAvailableBook(_id);

        emit returnBookEvent(msg.sender, _id, book);
    }

    function listUsersWhoTookBook(uint8 _id) external view BookExists(_id) returns(address[] memory){
        return libraryMap.get(_id).previouslyTaken;
    }

    function getAvailableBooks() external view returns(uint8[] memory){
        require(availableIds.length > 0, "There are no available books");
        return availableIds;
    }
}