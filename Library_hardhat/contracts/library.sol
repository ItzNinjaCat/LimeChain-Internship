// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0; 
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";

library BookMap{
    struct Book{
        uint8 availableCopies;
        address[] previouslyTaken;
    }

    struct Map {
        string[] keys;
        mapping(string => Book) books;
        mapping(string => uint8) indexOf;
        mapping(string => bool) inserted;
    }

    function get(Map storage map, string calldata key) internal view returns (Book storage) {
        return map.books[key];
    }

    // function getKeyAtIndex(Map storage map, uint8 index) internal view returns (uint8) {
    //     return map.keys[index];
    // }

    // function size(Map storage map) internal view returns (uint8) {
    //     return uint8(map.keys.length);
    // }

    function set(
        Map storage map,
        string calldata key,
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

    // function remove(Map storage map, uint8 key) internal {
    //     if (!map.inserted[key]) {
    //         return;
    //     }

    //     delete map.inserted[key];
    //     delete map.books[key];

    //     uint8 index = map.indexOf[key];
    //     uint8 lastIndex = uint8(map.keys.length) - 1;
    //     uint8 lastKey = map.keys[lastIndex];

    //     map.indexOf[lastKey] = index;
    //     delete map.indexOf[key];

    //     map.keys[index] = lastKey;
    //     map.keys.pop();
    // }
}

contract Library is Ownable{
    using BookMap for BookMap.Map;

    event addBookEvent(string isbn, BookMap.Book book);
    event borrowBookEvent(address indexed takenBy, string isbn, BookMap.Book book);
    event returnBookEvent(address indexed returnedBy, string isbn, BookMap.Book book);

    modifier BookExists(string calldata _isbn) {
        require(libraryMap.inserted[_isbn], "This book is not available");
        _;
    }
    BookMap.Map private libraryMap;

    uint public immutable takingFee;
    uint public immutable returnFine;
    uint public immutable returnBlockLimit;
    
    mapping(string => mapping(address => uint)) private currentlyTakenBooks;

    string[] private availableISBNs;
    mapping(string => uint8) private availableIndexMap;
    mapping(string => bool) private availableInsertedMap;

    constructor(uint _fee, uint _limit) {
        takingFee = _fee;
        returnFine = _fee * 2;
        returnBlockLimit = _limit;
    }

    receive() external payable {}

    function addAvailableBook(string calldata _isbn) private {
        if(!availableInsertedMap[_isbn]){
            availableInsertedMap[_isbn] = true;
            availableIndexMap[_isbn] = uint8(availableISBNs.length);
            availableISBNs.push(_isbn);
        }
    }

    function removeAvailableBook(string calldata _isbn) private {
        uint8 index = availableIndexMap[_isbn];
        uint8 lastIndex = uint8(availableISBNs.length) - 1;
        string memory lastISBN = availableISBNs[lastIndex];
        availableISBNs[index] = availableISBNs[lastIndex];
        availableISBNs.pop();
        availableIndexMap[lastISBN] = index;

        delete availableIndexMap[_isbn];
        delete availableInsertedMap[_isbn];
    }

    function getBalance() external view onlyOwner returns (uint){
        return address(this).balance;
    }

    function withdraw() external onlyOwner{
        require(address(this).balance > 0, "No fees to be withdrawn");
        bool success = payable(msg.sender).send(address(this).balance);
        require(success, "send failed");
    }

    function addBook(string calldata _isbn) external onlyOwner{
        BookMap.Book memory book;
        book.availableCopies = 1;
        libraryMap.set(_isbn, book);
        addAvailableBook(_isbn);
        emit addBookEvent(_isbn, book);
    }

    function takeBook(string calldata _isbn) external payable BookExists(_isbn){
        BookMap.Book storage book = libraryMap.get(_isbn);
        require(book.availableCopies > 0, "Book is not currently not available");
        require(currentlyTakenBooks[_isbn][msg.sender] == 0  , "User has already borrowed a copy of this book");
        require(msg.value >= takingFee, "Not enough ether to borrow book");

        if(msg.value > takingFee){
            bool success = payable(msg.sender).send(msg.value - takingFee);
            require(success, "send failed");
        }

        book.previouslyTaken.push(msg.sender);
        currentlyTakenBooks[_isbn][msg.sender] = block.number + 1;
        if(--book.availableCopies == 0){
            removeAvailableBook(_isbn);
        }

        emit borrowBookEvent(msg.sender, _isbn, book);
    }

    function returnBook(string calldata _isbn) external payable BookExists(_isbn){
        require(currentlyTakenBooks[_isbn][msg.sender] != 0, "User has not borrowed this book");
        if(currentlyTakenBooks[_isbn][msg.sender] + returnBlockLimit < block.number){
            require(msg.value >= returnFine, "Not enough ether to pay penalty");
            if(msg.value > returnFine){
                bool success = payable(msg.sender).send(msg.value - returnFine);
                require(success, "send failed");
            }
        }
        else{
            if(msg.value > 0){
                bool success = payable(msg.sender).send(msg.value);
                require(success, "send failed");
            }
        }
        BookMap.Book storage book = libraryMap.get(_isbn);
        book.availableCopies++;
        delete currentlyTakenBooks[_isbn][msg.sender];
        addAvailableBook(_isbn);

        emit returnBookEvent(msg.sender, _isbn, book);
    }

    function listUsersWhoTookBook(string calldata _isbn) external view BookExists(_isbn) returns(address[] memory){
        return libraryMap.get(_isbn).previouslyTaken;
    }

    function getAvailableBooks() external view returns(string[] memory){
        return availableISBNs;
    }
}