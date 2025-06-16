from typing import List

# class Book():
#     '''
#     Placeholder class for book.
#     '''

'''
The book list class stores all the book ids, 
'''

class BookList():
    '''
    A super class for the favorites, read books, and want to read book lists.
    '''

    def __init__(self) -> None:
        '''
        Initializes a book_list object.
        '''
        self.books: List[int] = [] # stores the book ids
        self.user_token: str = ""

    def __str__(self) -> str:
        '''
        String representation of a booklist object.
        Returns:
            str
        '''
        return f"{self.books}"

    def add_book(self, book_id: str) -> None:
        '''
        Adds a book object to the list.
        Args:
            book id: book id to be added.
        '''
        if type(book_id) != str:
            raise TypeError("Book_id should be given")

        self.books.append(book_id)

    def remove_book_by_index(self, index: int) -> None:
        '''
        Removes a book from the list by index.
        Args:
            index: int
        '''
        if type(index) != int:
            raise TypeError("Book_id should be given")
        
        if index > len(self.books):
            raise ValueError("Index of list books out of range")
        
        self.books.pop(index)


    def remove_book_by_id(self, book_id: str) -> None:
        '''
        Removes a book from the list by a given book id.
        Args:
            book_id: str
        '''
        if type(book_id) != str:
            raise TypeError("Book_id should be given")

        if not book_id in self.books:
            raise ValueError("Book_id not in list of books")
        else:
            self.books.remove(book_id)

    def get_book_list(self) -> List[str]:
        '''
        Returns the book list.
        Returns:
            list of books.
        '''
        return self.books

    def get_book_by_index(self, index: int) -> str:
        '''
        Returns a book from the list by the given index.
        Args:
            index: int
        Returns:
            book id: str
        '''
        if index > len(self.books):
            raise ValueError("Index of list books out of range")

        return self.books[index]

    def clear_book_list(self) -> None:
        '''
        Removes all books from the list.
        '''

        self.books = []


favorites = BookList()
read_books = BookList()
want_to_read = BookList()