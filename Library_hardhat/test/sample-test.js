const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const foo = "foo";
const foo_bytes = "0xb93d94462a1aca054f8944d65bafc36d7b7f2256072a7eadbf1d4a240f4adef7";
const bar = "bar";


describe("Library contract", function () {
    let Library;
    let library;
    let LibToken;
    let libToken;
    let owner;
    let addr1;
    let preparedSignatureOwner;
    let preparedSignatureAddr1;

    async function generateSignature(address, value) {
      const nonce = (await libToken.nonces(address)); // Our Token Contract Nonces
      const deadline = + new Date() + 60 * 60; // Permit with deadline which the permit is valid
      const wrapValue = ethers.utils.parseEther(value); // Value to approve for the spender to use
      
      const EIP712Domain = [ // array of objects -> properties from the contract and the types of them ircwithPermit
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'verifyingContract', type: 'address' }
      ];
    
      const domain = {
          name: await libToken.name(),
          version: '1',
          verifyingContract: libToken.address
      };
    
      const Permit = [ // array of objects -> properties from erc20withpermit
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
      ];
    
      const message = {
          owner: address,
          spender: library.address,
          value: wrapValue.toString(),
          nonce: nonce.toHexString(),
          deadline
      };
    
      const data = JSON.stringify({
          types: {
              EIP712Domain,
              Permit
          },
          domain,
          primaryType: 'Permit',
          message
      })
    
      const signatureLike = await library.provider.send('eth_signTypedData_v4', [address, data]);
      const signature = await ethers.utils.splitSignature(signatureLike)
    
       return ({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline
      })
    }
    

    beforeEach(async function () {
      [owner, addr1] = await ethers.getSigners();
      LibToken = await ethers.getContractFactory("LIB");
      libToken = await LibToken.deploy();
      await libToken.deployed();
      Library = await ethers.getContractFactory("Library");
      library = await Library.deploy(ethers.utils.parseEther('0.1'), 1, libToken.address);
      await library.deployed();
      //library.provider.pollingInterval = 1;
      // preparedSignatureOwner = await generateSignature(owner.address);
      // preparedSignatureAddr1 = await generateSignature(addr1.address);
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
        await expect(library.connect(addr1).addBook(foo)).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("borrowBook tests", function () {
      it("Should take a book and pay a fee", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        const tx = await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        );

        const receipt = await tx.wait();
        expect(receipt.events[3].args.id).to.equal(foo_bytes);
        expect(receipt.events[3].args.book.isbn).to.equal(foo);
        expect(receipt.events[3].args.book.availableCopies).to.equal(0);
        expect(receipt.events[3].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });

      it("Should throw error for value < fee", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("0.0001")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.000000001");
        await expect(
          library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.000000001"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        ))
        .to.be.revertedWith("Token allowance too low");
      });
      it("Should throw error for user that already took this book ", async function () {
        await library.addBook(foo);
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await expect(library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        ))
        .to.be.revertedWith("User has already borrowed a copy of this book");
      });
      it("Should throw error for unavailable book(nonexistent)", async function () {
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await expect(library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        ))
        .to.be.revertedWith("This book is not available");
      });
      it("Should throw error for unavailable book(already taken)", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )

        await library.connect(addr1).deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await expect(library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        ))
        .to.be.revertedWith("Book is not currently not available");
      });
    });

    describe("returnBook tests", function () {
      it("Should return a book", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )
        const tx = await library.returnBook(foo_bytes);
        const receipt = await tx.wait();
        expect(receipt.events[1].args.id).to.equal(foo_bytes);
        expect(receipt.events[1].args.book.isbn).to.equal(foo);
        expect(receipt.events[1].args.book.availableCopies).to.equal(1);
        expect(receipt.events[1].args.book.previouslyTaken).to.deep.equal([owner.address]);
      });
      it("Should return book late and pay a fine", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("10")});
        await library.connect(addr1).deposit({value: ethers.utils.parseEther("10")});

        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.addBook(foo);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.addBook(foo);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(2);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        await library.addBook(foo);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(2);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes);
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
    });


    describe("getAvailableBooks tests", function () {
      it("Should return an array with the ids of all available books", async function () {
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});

        await library.connect(addr1).deposit({value: ethers.utils.parseEther("1")});
        await libToken.connect(addr1).approve(library.address, 10000000000000);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        await library.addBook(foo);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        expect(await library.getAvailableBooksLength()).to.deep.equal(1);
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        )
        expect(await library.getAvailableBooksLength())
        .to.deep.equal(0);
        await library.connect(addr1).returnBook(foo_bytes);
        await library.addBook(bar);
        await library.returnBook(foo_bytes);
        expect(await library.getAvailableBooksLength()).to.deep.equal(2);

      });
    });

    describe("withdraw tests", function () {
      it("Should withdraw all fees to the owners wallet", async function () {
        await library.addBook(foo);
        await library.connect(addr1).deposit({value: ethers.utils.parseEther("10")});
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        await library.connect(addr1).returnBook(foo_bytes);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );

        await library.connect(addr1).returnBook(foo_bytes);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        await library.connect(addr1).returnBook(foo_bytes);
        preparedSignatureAddr1 = await generateSignature(addr1.address, "0.3");
        await library.connect(addr1).borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureAddr1.deadline, 
          preparedSignatureAddr1.v, 
          preparedSignatureAddr1.r, 
          preparedSignatureAddr1.s
        );
        await library.connect(addr1).returnBook(foo_bytes);
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("400000000000000000"));
        await library.withdraw();
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("0"));
      });
      it("Should throw error for no fees to be withdrawn", async function () {
        await expect(library.withdraw()).to.be.revertedWith("No fees to be withdrawn");
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("0"));
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
    
    describe("getBalance tests", function () {
      it("Should return the balance of the user", async function () {
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("0"));
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        );
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("700000000000000000"));
        await library.returnBook(foo_bytes);
        expect(await library.getBalance()).to.equal(ethers.BigNumber.from("900000000000000000"));
      });
    });

    describe("getLibraryBalance tests", function () {
      it("Should return the total amount of fees taken", async function () {
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("0"));
        await library.addBook(foo);
        await library.deposit({value: ethers.utils.parseEther("1")});
 
        preparedSignatureOwner = await generateSignature(owner.address, "0.3");
        await library.borrowBook(
          foo_bytes,
          ethers.utils.parseEther("0.3"),
          preparedSignatureOwner.deadline, 
          preparedSignatureOwner.v, 
          preparedSignatureOwner.r, 
          preparedSignatureOwner.s
        );
        expect(await library.getLibraryBalance()).to.equal(ethers.BigNumber.from("100000000000000000"));
      });
      it("Should throw error for user that is not owner", async function () {
        await expect(library.connect(addr1).getLibraryBalance()).to.be.revertedWith("Ownable: caller is not the owner");
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

    describe("getBooksCount tests", function () {
      it("Should return the amount of books in the library", async function () {
        await library.addBook(foo);
        expect(await library.getBooksCount()).to.equal(1);
        await library.addBook(bar);
        expect(await library.getBooksCount()).to.equal(2);
      });
    });
});
