// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.0; 
pragma abicoder v2; 
import "./ownable.sol" as ownable;

contract Library is ownable.Ownable{

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
        mapping(address => bool) takingMap;
    }

    mapping(uint => takingArchive) private currentlyTakenBooks;
    mapping(uint => takingArchive) private takenBooks;
    
    mapping(uint => Book) private booksMap;
    uint[] private bookIds;
    Book[] private availableBooks;

    function addBook(string calldata name, string calldata ISBN, string calldata authorName, uint releseDate, uint id) public onlyOwner{

            if(booksMap[id].id == 0){
                Book memory book = Book(name, ISBN, authorName, id, releseDate, 1);
                booksMap[id] = book;
                bookIds.push(id);
            }
            else{
                
                booksMap[id].availableCopies++;
            }
    }

    function takeBook(uint id) public{
        require(booksMap[id].availableCopies > 0, "Book is not currently not available");
        require(!currentlyTakenBooks[id].takingMap[msg.sender], "User has already borrowed a copy of this book");
        booksMap[id].availableCopies--;

        if(!takenBooks[id].takingMap[msg.sender]){
            takenBooks[id].addressList.push(msg.sender);
            takenBooks[id].takingMap[msg.sender] = true;
        }
        currentlyTakenBooks[id].takingMap[msg.sender] = true;
        currentlyTakenBooks[id].addressList.push(msg.sender);
    }

    function returnBook(uint id) public{
        require(currentlyTakenBooks[id].takingMap[msg.sender], "User has not borrowed this book");
        booksMap[id].availableCopies++;
        currentlyTakenBooks[id].takingMap[msg.sender] = false;
        for(uint i = 0; i < currentlyTakenBooks[id].addressList.length; i++){
            if(currentlyTakenBooks[id].addressList[i] == msg.sender){
                currentlyTakenBooks[id].addressList[i] = currentlyTakenBooks[id].addressList[currentlyTakenBooks[id].addressList.length - 1];
                currentlyTakenBooks[id].addressList.pop();
                break;
            }
        }
    }

    function listUsersWhoTookBook(uint id) public view returns(address[] memory){
        require(booksMap[id].id != 0, "This book is not available");
        return takenBooks[id].addressList;
    }

    function getAvailableBooks() public returns(Book[] memory){
        require(bookIds.length > 0, "There are no books in the library");
        delete availableBooks;
        for(uint i = 0; i < bookIds.length; i++){
            if(booksMap[bookIds[i]].availableCopies > 0){
                availableBooks.push(booksMap[bookIds[i]]);
            }
        }
        require(availableBooks.length > 0, "There are no available books");
        return availableBooks;
    }
}