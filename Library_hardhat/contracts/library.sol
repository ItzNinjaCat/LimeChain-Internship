// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LIB.sol";

library BookMap {
    struct Book {
        string isbn;
        uint8 availableCopies;
        address[] previouslyTaken;
    }

    struct Map {
        bytes32[] keys;
        mapping(bytes32 => Book) books;
        mapping(bytes32 => uint8) indexOf;
        mapping(bytes32 => bool) inserted;
    }

    function get(Map storage map, bytes32 key)
        internal
        view
        returns (Book storage)
    {
        return map.books[key];
    }

    function getKeyAtIndex(Map storage map, uint8 index)
        internal
        view
        returns (bytes32)
    {
        return map.keys[index];
    }

    function size(Map storage map) internal view returns (uint8) {
        return uint8(map.keys.length);
    }

    function set(
        Map storage map,
        bytes32 key,
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

contract Library is Ownable {
    using BookMap for BookMap.Map;

    LIB token;

    event addBookEvent(bytes32 id, BookMap.Book book);
    event borrowBookEvent(
        address indexed takenBy,
        bytes32 indexed id,
        BookMap.Book book
    );
    event returnBookEvent(
        address indexed returnedBy,
        bytes32 indexed id,
        BookMap.Book book
    );
    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    modifier BookExists(bytes32 _id) {
        require(libraryMap.inserted[_id], "This book is not available");
        _;
    }
    BookMap.Map private libraryMap;

    uint256 public immutable takingFee;
    uint256 public immutable returnFine;
    uint256 public immutable returnBlockLimit;

    uint256 private feesCollected;
    mapping(bytes32 => mapping(address => uint256)) private currentlyTakenBooks;

    bytes32[] private availableIds;
    mapping(bytes32 => uint8) private availableIndexMap;
    mapping(bytes32 => bool) private availableInsertedMap;

    constructor(
        uint256 _fee,
        uint256 _limit,
        address _tokenAddress
    ) {
        takingFee = _fee;
        returnFine = _fee * 2;
        returnBlockLimit = _limit;
        token = LIB(_tokenAddress);
    }

    receive() external payable {}

    function addAvailableBook(bytes32 _id) private {
        if (!availableInsertedMap[_id]) {
            availableInsertedMap[_id] = true;
            availableIndexMap[_id] = uint8(availableIds.length);
            availableIds.push(_id);
        }
    }

    function removeAvailableBook(bytes32 _id) private {
        uint8 index = availableIndexMap[_id];
        uint8 lastIndex = uint8(availableIds.length) - 1;
        bytes32 lastISBN = availableIds[lastIndex];
        availableIds[index] = availableIds[lastIndex];
        availableIds.pop();
        availableIndexMap[lastISBN] = index;

        delete availableIndexMap[_id];
        delete availableInsertedMap[_id];
    }

    function getBalance() external view returns (uint256) {
        return token.balanceOf(msg.sender);
    }

    function getLibraryBalance() external view onlyOwner returns (uint256) {
        return feesCollected;
    }

    function deposit() public payable {
        token.mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        require(feesCollected > 0, "No fees to be withdrawn");
        bool success = payable(msg.sender).send(feesCollected);
        require(success, "send failed");
        token.burn(address(this), feesCollected);
        feesCollected = 0;
    }

    function addBook(string calldata _isbn) external onlyOwner {
        bytes32 _id = keccak256(abi.encode(_isbn));
        BookMap.Book memory book;
        book.isbn = _isbn;
        book.availableCopies = 1;
        libraryMap.set(_id, book);
        addAvailableBook(_id);
        emit addBookEvent(_id, book);
    }

    function borrowBook(
        bytes32 _id,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external BookExists(_id) {
        BookMap.Book storage book = libraryMap.get(_id);
        require(
            book.availableCopies > 0,
            "Book is not currently not available"
        );
        require(
            currentlyTakenBooks[_id][msg.sender] == 0,
            "User has already borrowed a copy of this book"
        );
        token.permit(msg.sender, address(this), value, deadline, v, r, s);
        require(
            token.allowance(msg.sender, address(this)) >=
                takingFee + returnFine,
            "Token allowance too low"
        );
        bool success = token.transferFrom(
            msg.sender,
            address(this),
            takingFee + returnFine
        );
        require(success, "transfer failed");
        feesCollected += takingFee;
        book.previouslyTaken.push(msg.sender);
        currentlyTakenBooks[_id][msg.sender] = block.number + 1;
        if (--book.availableCopies == 0) {
            removeAvailableBook(_id);
        }

        emit borrowBookEvent(msg.sender, _id, book);
    }

    function returnBook(bytes32 _id) external BookExists(_id) {
        require(
            currentlyTakenBooks[_id][msg.sender] != 0,
            "User has not borrowed this book"
        );
        if (
            currentlyTakenBooks[_id][msg.sender] + returnBlockLimit >=
            block.number
        ) {
            bool success = token.transfer(msg.sender, returnFine);
            require(success, "transfer failed");
        } else {
            feesCollected += returnFine;
        }

        BookMap.Book storage book = libraryMap.get(_id);
        book.availableCopies++;
        delete currentlyTakenBooks[_id][msg.sender];
        addAvailableBook(_id);

        emit returnBookEvent(msg.sender, _id, book);
    }

    function getAvailableBooksLength() external view returns (uint256) {
        return availableIds.length;
    }

    function getAvailableBook(uint8 _index)
        external
        view
        returns (BookMap.Book memory)
    {
        require(
            availableIds.length > _index && availableIds.length > 0,
            "Index out ot range"
        );
        return libraryMap.get(availableIds[_index]);
    }

    function getBookByIndex(uint8 _index)
        external
        view
        returns (BookMap.Book memory)
    {
        require(
            libraryMap.size() > _index && libraryMap.size() > 0,
            "Index out ot range"
        );
        return libraryMap.get(libraryMap.getKeyAtIndex(_index));
    }

    function getBooksCount() external view returns (uint8) {
        return libraryMap.size();
    }

    function getBook(bytes32 _id)
        external
        view
        BookExists(_id)
        returns (BookMap.Book memory)
    {
        return libraryMap.get(_id);
    }
}
