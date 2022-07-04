// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0; 
pragma abicoder v2; 
import "./ownable.sol" as ownable;

contract Library is ownable.Ownable{

    enum EventType{
        BookAdded,
        BookCopyAdded,
        BookTaken,
        BookReturned
    }

    struct Book{
        string name;
        string ISBN;
        string authorName;
        uint id;
        uint releseDate;
        uint availableCopies;
    }

    struct takingArchive {
        address[] addressList;
        mapping(address => uint) takingMap;
    }

    mapping(uint => takingArchive) private currentlyTakenBooks;
    mapping(uint => takingArchive) private takenBooks;
    
    mapping(uint => Book) private booksMap;
    Book[] private availableBooks;
    mapping(uint => uint) private availableIndexMap;

    event LogEvent(address, Book, EventType);

    function addBook(string calldata name, string calldata ISBN, string calldata authorName, uint releseDate) public onlyOwner{
            uint id = uint(keccak256(abi.encodePacked((ISBN)))) % 100;
            if(booksMap[id].id == 0){
                Book memory book = Book(name, ISBN, authorName, id, releseDate, 1);
                booksMap[id] = book;
                emit LogEvent(msg.sender, booksMap[id], EventType.BookAdded);
            }
            else{
                require((keccak256(abi.encodePacked((name))) == keccak256(abi.encodePacked((booksMap[id].name)))), "A different book with this ISBN already exists");
                require((keccak256(abi.encodePacked((authorName))) == keccak256(abi.encodePacked((booksMap[id].authorName)))), "A different book with this ISBN already exists");
                require(releseDate == booksMap[id].releseDate, "A different book with this ISBN already exists");
                booksMap[id].availableCopies++;
                emit LogEvent(msg.sender, booksMap[id], EventType.BookCopyAdded);
            }

            if(availableIndexMap[id] == 0){
                availableBooks.push(booksMap[id]);
                availableIndexMap[id] = availableBooks.length;
            }
            else{
                availableBooks[availableIndexMap[id] - 1].availableCopies++;
            }
    }

    function takeBook(uint id) public{
        require(booksMap[id].availableCopies > 0, "Book is not currently not available");
        require(currentlyTakenBooks[id].takingMap[msg.sender] == 0 , "User has already borrowed a copy of this book");
        booksMap[id].availableCopies--;

        if(takenBooks[id].takingMap[msg.sender] == 0){
            takenBooks[id].addressList.push(msg.sender);
            takenBooks[id].takingMap[msg.sender] = takenBooks[id].addressList.length;
        }
        currentlyTakenBooks[id].addressList.push(msg.sender);
        currentlyTakenBooks[id].takingMap[msg.sender] = currentlyTakenBooks[id].addressList.length;

        availableBooks[availableIndexMap[id] - 1].availableCopies--;
        if(booksMap[id].availableCopies == 0){
            availableBooks[availableIndexMap[id] - 1] = availableBooks[availableBooks.length - 1];
            availableIndexMap[availableBooks[availableIndexMap[id] - 1].id] = availableBooks[availableIndexMap[id] - 1].availableCopies;
            availableBooks.pop();
            availableIndexMap[id] = 0;
        }
        emit LogEvent(msg.sender, booksMap[id], EventType.BookTaken);
    }

    function returnBook(uint id) public{
        require(currentlyTakenBooks[id].takingMap[msg.sender] > 0, "User has not borrowed this book");
        booksMap[id].availableCopies++;
        currentlyTakenBooks[id].addressList[currentlyTakenBooks[id].takingMap[msg.sender] - 1] = currentlyTakenBooks[id].addressList[currentlyTakenBooks[id].addressList.length - 1];
        currentlyTakenBooks[id].takingMap[currentlyTakenBooks[id].addressList[currentlyTakenBooks[id].takingMap[msg.sender] - 1]] = currentlyTakenBooks[id].takingMap[msg.sender];
        currentlyTakenBooks[id].takingMap[msg.sender] = 0;
        currentlyTakenBooks[id].addressList.pop();
        if(availableIndexMap[id] == 0){
            availableBooks.push(booksMap[id]);
            availableIndexMap[id] = availableBooks.length;
        }
        else{
            availableBooks[availableIndexMap[id] - 1].availableCopies++;
        }
        emit LogEvent(msg.sender, booksMap[id], EventType.BookReturned);
    }

    function listUsersWhoTookBook(uint id) public view returns(address[] memory){
        require(booksMap[id].id != 0, "This book is not available");
        return takenBooks[id].addressList;
    }

    function getAvailableBooks() public view returns(Book[] memory){
        require(availableBooks.length > 0, "There are no available books");
        return availableBooks;
    }


}