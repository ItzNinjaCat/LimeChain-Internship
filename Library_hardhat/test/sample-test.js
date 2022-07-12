const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const foo = "foo";
const foo_bytes = "0xb93d94462a1aca054f8944d65bafc36d7b7f2256072a7eadbf1d4a240f4adef7";
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

        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([]);
      });
  
      it("Should add another copy of the book 'foo'", async function () {
        const tx = await library.addBook(foo);
        const receipt = await tx.wait();
        expect(tx).to.emit(library, "addBookEvent");
        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
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

        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([]);
        

        // for( var event in receipt.events){
        //   console.log(event.id);
        // }
        // expect(receipt.events[1].args.id).to.equal(foo);
        // expect(receipt.events[1].args.book.id).to.equal(foo);
        // expect(receipt.events[1].args.book.availableCopies).to.equal(2);
        // expect(receipt.events[1].args.book.previouslyTaken).to.deep.equal([]);
        
        // expect(receipt.events[1].args.id).to.equal(foo);
        // expect(receipt.events[1].args.book.id).to.equal(bar);
        // expect(receipt.events[1].args.book.availableCopies).to.equal(1);
        // expect(receipt.events[1].args.book.previouslyTaken).to.deep.equal([]);

        // expect(receipt.events[3].args.id).to.equal(foo);
        // expect(receipt.events[3].args.book.id).to.equal(bar);
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
        const tx = await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000020")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(0);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });
      it("Should take a book and pay a fee and return the extra eth", async function () {
        await library.addBook(foo);
        const tx = await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(0);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });

      it("Should throw error for value < fee", async function () {
        await library.addBook(foo);
        await expect(library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000019")}))
        .to.be.revertedWith("Not enough ether to borrow book");
      });
      it("Should throw error for user that already took this book ", async function () {
        await library.addBook(foo);
        await library.addBook(foo);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.0000000000000002")});
        await expect(library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("User has already borrowed a copy of this book");
      });
      it("Should throw error for unavailable book(nonexistent)", async function () {
        await expect(library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("This book is not available");
      });
      it("Should throw error for unavailable book(already taken)", async function () {
        await library.addBook(foo);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.0000000000000002")});
        await expect(library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.0000000000000002")}))
        .to.be.revertedWith("Book is not currently not available");
      });
    });

    describe("returnBook tests", function () {
      it("Should return a book", async function () {
        await library.addBook(foo);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        const tx = await library.returnBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000020")});
        const receipt = await tx.wait();
        expect(receipt.events[0].args.id).to.equal(foo_bytes);
        expect(receipt.events[0].args.book.isbn).to.equal(foo);
        expect(receipt.events[0].args.book.availableCopies).to.equal(1);
        expect(receipt.events[0].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });
      it("Should return book late and pay a fine", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000040")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(2);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(2);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000090")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
      });
      it("Should throw an error for a book the user has not taken", async function () {
        await library.addBook(foo);
        await expect(library.returnBook(foo_bytes))
        .to.be.revertedWith("User has not borrowed this book");
      });
      it("Should throw an error for a book that is unavailable", async function () {
        await expect(library.returnBook(foo_bytes))
        .to.be.revertedWith("This book is not available");
      });
      it("Should throw an error for not enough ether to pay fine", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await expect(library.returnBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000020")}))
        .to.be.revertedWith("Not enough ether to pay penalty");
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
      });
    });


    describe("getAvailableBooks tests", function () {
      it("Should return an array with the ids of all available books", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes, {value: ethers.utils.parseEther("0.00000000000000090")});
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);

      });
    });

    describe("withdraw tests", function () {
      it("Should withdraw all fees to the owners wallet", async function () {
        await library.addBook(foo);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo_bytes);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo_bytes);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo_bytes);
        await library.connect(addr1).takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        await library.connect(addr1).returnBook(foo_bytes);
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
        await library.takeBook(foo_bytes, {value: ethers.utils.parseEther("0.001")});
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("200"));
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).getBalance()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("getAvaialableBook tests", function () {
      it("Should return the book standing at a given index", async function () {
        await library.addBook(foo);
        expect(await library.getAvailableBook(0)).to.deep.equal([foo, 1, []]);
      });
      it("Should throw error for index out of range", async function () {
        await expect(library.getAvailableBook(0)).to.be.revertedWith("Index out ot range");
        await library.addBook(foo);
        await expect(library.getAvailableBook(1)).to.be.revertedWith("Index out ot range");
      });
    });

    describe("getAvaialableBookLength tests", function () {
      it("Should return the amount of available books", async function () {
        expect(await library.getAvailableBooksLength()).to.equal(0);
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.equal(1);
        await library.addBook(bar);
        expect(await library.getAvailableBooksLength()).to.equal(2);
      });
    });

    describe("getBookByIndex tests", function () {
      it("Should return the book standing at a given index", async function () {
        await library.addBook(foo);
        expect(await library.getBookByIndex(0)).to.deep.equal([foo, 1, []]);
      });
      it("Should throw error for index out of range", async function () {
        await expect(library.getBookByIndex(0)).to.be.revertedWith("Index out ot range");
        await library.addBook(foo);
        await expect(library.getBookByIndex(1)).to.be.revertedWith("Index out ot range");
      });
    });
    describe("getBookByIndex tests", function () {
      it("Should return book based on id", async function () {
        await library.addBook(foo);
        expect(await library.getBook(foo_bytes)).to.deep.equal([foo, 1, []]);
      });
      it("Should throw error for nonexistent book", async function () {
        await expect(library.getBook("0xb93d94462a1aca054f8944d65bafc36d7b7f2256072a7eadbf1d4a240f4adef8"))
        .to.be.revertedWith("This book is not available");
        await library.addBook(foo);
        await expect(library.getBook("0xb93d94462a1aca054f8944d65bafc36d7b7f2256072a7eadbf1d4a240f4adef9"))
        .to.be.revertedWith("This book is not available");
      });
    });
});
