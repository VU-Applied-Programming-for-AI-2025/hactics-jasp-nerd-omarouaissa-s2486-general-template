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

    def add_book(self, book_id: int) -> None:
        '''
        Adds a book object to the list.
        Args:
            book: Book object to be added.
        '''
        if type(book_id) != int:
            raise TypeError("Book object should be given")

        self.books.append(book_id)

    def remove_book_by_id(self, id: int) -> None:
        '''
        Removes a book from the list by id.
        Args:
            id: int
        '''
        if type(id) != int:
            raise TypeError("Book object should be given")
        
        if id > len(self.books):
            raise ValueError("Index of list books out of range")
        
        self.books.pop(id)


    def remove_book_by_object(self, book: Book) -> None:
        '''
        Removes a book from the list by a given book object.
        Args:
            book: Book
        '''
        if type(book) != Book:
            raise TypeError("Book object should be given")

        if not book in self.books:
            raise ValueError("Book object not in list of books")

        self.books.remove(book)

    def get_book_list(self) -> List[Book]:
        '''
        Returns the book list.
        Returns:
            list of books.
        '''
        return self.books

    def get_book_by_id(self, id: int) -> Book:
        '''
        Returns a book from the list by the given id.
        Args:
            id: int
        Returns:
            Book
        '''
        if id > len(self.books):
            raise ValueError("Index of list books out of range")

        return self.books[id]

    def clear_book_list(self) -> None:
        '''
        Removes all books from the list.
        '''

        self.books = []


favorites = BookList()
read_books = BookList()
want_to_read = BookList()
