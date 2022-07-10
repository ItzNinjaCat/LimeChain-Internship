import React from "react";

interface IProps {
  borderStyle: string;
  color: string;
  children?: React.ReactNode;
  height: string;
  width: string;
  bookObj : any;
}

const Book = (props : IProps) =>(
  <div style = {{
    backgroundColor : props.color,
    borderStyle : props.borderStyle,
    height : props.height,
    width : props.width
  }}>
    {typeof props.bookObj !== undefined &&
      <img src= {props.bookObj.thumbnail}/> &&
      <p>Title - {props.bookObj.title}</p>
    }
    {/* {
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
    {
      props.bookObj.hasOwnProperty('description') &&
      <p>Description - {props.bookObj.description}</p>
    }
    {
      props.bookObj.hasOwnProperty('pageCount') &&
      <p>Page Count - {props.bookObj.pageCount}</p>
    }
    {
      props.bookObj.hasOwnProperty('categories') &&
      <p>Categories - {props.bookObj.categories.map((categorie : string )=> categorie).join(', ')}</p>
    } */}
    {props.children}
  </div>
)

// const Book: React.FC<Props> = ({ 
//   borderStyle,
//     color,
//     children,
//     height,
//     width,
//   }) => { 
//   return (
//     <div 
//       style={{
//          backgroundColor: color,
//          borderStyle,
//          height,
//          width
//       }}
//     >
//     {children}
//     </div>
//   );
// }

Book.defaultProps = {
  borderStyle: "solid",
  color: "#74eded",
  height: "200px",
  width: "1000px"
}
export default Book;