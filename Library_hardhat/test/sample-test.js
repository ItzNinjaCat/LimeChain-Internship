const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const foo = "foo";
const bar = "bar";
describe("Library contract", function () {
    let Library;
    let library;
    let owner;
    let addr1;
    beforeEach(async function () {
      [owner, addr1] = await ethers.getSigners();
      Library = await ethers.getContractFactory("Library");
      library = await Library.deploy(200, 1);
      await library.deployed();
      //library.provider.pollingInterval = 1;
    });
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        expect(await library.owner()).to.equal(owner.address);
      });
    });

    describe("AddBook tests", function () {
      it("Should add a book and emit an event with its id and the book itself", async function () {
        const tx = await library.addBook(foo);
        const receipt = await tx.wait();
        expect(tx).to.emit(library, "addBookEvent");

        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([]);
      });
  
      it("Should add another copy of the book 'foo'", async function () {
        const tx = await library.addBook(foo);
        const receipt = await tx.wait();
        expect(tx).to.emit(library, "addBookEvent");
        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([]);
        expect(tx).to.emit(library, "addBookEvent");
        await library.addBook(foo);
      });
      it("Should add multiple books", async function () {
        const tx = await library.addBook(foo);
        const receipt = await tx.wait();
        expect(tx).to.emit(library, "addBookEvent");
        expect(tx).to.emit(library, "addBookEvent");
        expect(await library.addBook(bar)).to.emit(library, "addBookEvent");
        expect(await library.addBook(bar)).to.emit(library, "addBookEvent");

        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([]);
        

        // for( var event in receipt.events){
        //   console.log(event.isbn);
        // }
        // expect(receipt.events[1].args.id).to.equal(foo);
        // expect(receipt.events[1].args.book.isbn).to.equal(foo);
        // expect(receipt.events[1].args.book.availableCopies).to.equal(2);
        // expect(receipt.events[1].args.book.previouslyTaken).to.deep.equal([]);
        
        // expect(receipt.events[1].args.id).to.equal(foo);
        // expect(receipt.events[1].args.book.isbn).to.equal(bar);
        // expect(receipt.events[1].args.book.availableCopies).to.equal(1);
        // expect(receipt.events[1].args.book.previouslyTaken).to.deep.equal([]);

        // expect(receipt.events[3].args.id).to.equal(foo);
        // expect(receipt.events[3].args.book.isbn).to.equal(bar);
        // expect(receipt.events[3].args.book.availableCopies).to.equal(1);
        // expect(receipt.events[3].args.book.previouslyTaken).to.deep.equal([]);
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).getBalance()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("takeBook tests", function () {
      it("Should take a book and pay a fee", async function () {
        await library.addBook(foo);
        const tx = await library.takeBook(foo, {value: ethers.utils.parseEther("0.00000000000000020")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(0);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });
      it("Should take a book and pay a fee and return the extra eth", async function () {
        await library.addBook(foo);
        const tx = await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(0);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });

      it("Should throw error for value < fee", async function () {
        await library.addBook(foo);
        await expect(library.takeBook(foo, {value: ethers.utils.parseEther("0.00000000000000019")}))
        .to.be.revertedWith("Not enough ether to borrow book");
      });
      it("Should throw error for user that already took this book ", async function () {
        await library.addBook(foo);
        await library.addBook(foo);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.0000000000000002")});
        await expect(library.takeBook(foo, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("User has already borrowed a copy of this book");
      });
      it("Should throw error for unavailable book(nonexistent)", async function () {
        await expect(library.takeBook(foo, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("This book is not available");
      });
      it("Should throw error for unavailable book(already taken)", async function () {
        await library.addBook(foo);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.0000000000000002")});
        await expect(library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("Book is not currently not available");
      });
    });

    describe("returnBook tests", function () {
      it("Should return a book", async function () {
        await library.addBook(foo);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        const tx = await library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000020")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });
      it("Should return book late and pay a fine", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        await library.addBook(bar);
        await library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000040")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
        await library.addBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([foo, bar]);
        await library.connect(addr1).returnBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([foo, bar]);
        await library.connect(addr1).returnBook(foo);
        await library.addBook(bar);
        await library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000090")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
      });
      it("Should throw an error for a book the user has not taken", async function () {
        await library.addBook(foo);
        await expect(library.returnBook(foo))
        .to.be.revertedWith("User has not borrowed this book");
      });
      it("Should throw an error for a book that is unavailable", async function () {
        await expect(library.returnBook(foo))
        .to.be.revertedWith("This book is not available");
      });
      it("Should throw an error for not enough ether to pay fine", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        await library.addBook(bar);
        await expect(library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000020")}))
        .to.be.revertedWith("Not enough ether to pay penalty");
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);
      });
    });

    describe("listUsersWhoTookBook tests", function () {
      it("Should return an array with all users that took acertain book", async function () {
        await library.addBook(foo);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000020")});
        expect(await library.listUsersWhoTookBook(foo)).to.deep.equal([owner.address]);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000020")});
        expect(await library.listUsersWhoTookBook(foo)).to.deep.equal([owner.address, addr1.address]);
      });
      it("Should throw error for nonexistent book", async function () {
        await expect(library.listUsersWhoTookBook(foo))
        .to.be.revertedWith("This book is not available");
      });
    });

    describe("getAvailableBooks tests", function () {
      it("Should return an array with the ids of all available books", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo]);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooks())
        .to.deep.equal([]);
        await library.connect(addr1).returnBook(foo);
        await library.addBook(bar);
        await library.returnBook(foo, {value: ethers.utils.parseEther("0.00000000000000090")});
        expect(await library.getAvailableBooks()).to.deep.equal([foo, bar]);

      });
    });

    describe("withdraw tests", function () {
      it("Should withdraw all fees to the owners wallet", async function () {
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo);
        await library.connect(addr1).takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo);
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("800"));
        await library.withdraw();
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("0"));
      });
      it("Should throw error for no fees to ne withdrawn", async function () {
        await expect(library.withdraw()).to.be.revertedWith("No fees to be withdrawn");
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("0"));
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).getBalance()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
    
    describe("getBalance tests", function () {
      it("Should return a the total amount of fees taken", async function () {
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("0"));
        await library.addBook(foo);
        await library.takeBook(foo, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("200"));
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).getBalance()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
});
