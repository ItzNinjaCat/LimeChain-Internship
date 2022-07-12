import React from "react";

interface IProps {
  borderStyle: string;
  color: string;
  children?: React.ReactNode;
  height: string;
  width: string;
  bookObj : any;
  padding : string;
}

const Book = (props : IProps) =>(
  <div style = {{
    backgroundColor : props.color,
    borderStyle : props.borderStyle,
    height : props.height,
    width : props.width,
    padding : props.padding,
  }}>
    {
      props.bookObj.hasOwnProperty('imageLinks') &&
      <img src= {props.bookObj.imageLinks.thumbnail}/>
    }
    {
      props.bookObj.hasOwnProperty('title') &&
      <p>Title - {props.bookObj.title}</p>
    }
    {
      props.bookObj.hasOwnProperty('subtitle') &&
      <p>Subtitle - {props.bookObj.subtitle}</p>
    }
    {
      props.bookObj.hasOwnProperty('authors') &&
      
      <p>Authors - {props.bookObj.authors.map((author : string )=> author).join(', ')}</p>
    }
    {
      props.bookObj.hasOwnProperty('publisher') &&
      <p>Publisher - {props.bookObj.publisher}</p>
    }
    {
      props.bookObj.hasOwnProperty('publishedDate') &&
      <p>Published Date - {props.bookObj.publishedDate}</p>
    }
    {/* {
      props.bookObj.hasOwnProperty('description') &&
      <p>Description - {props.bookObj.description}</p>
    } */}
    {
      props.bookObj.hasOwnProperty('pageCount') &&
      <p>Page Count - {props.bookObj.pageCount}</p>
    }
    {
      props.bookObj.hasOwnProperty('categories') &&
      <p>Categories - {props.bookObj.categories.map((categorie : string )=> categorie).join(', ')}</p>
    }
    {props.children}
  </div>
)


Book.defaultProps = {
  borderStyle: "hidden",
  color: "#4099ff80",
  height: "auto",
  width: "500px",
  bookObj : null,
  padding : "20px"
}
export default Book;