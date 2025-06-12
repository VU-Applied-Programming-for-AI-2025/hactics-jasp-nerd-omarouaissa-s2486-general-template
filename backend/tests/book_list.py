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
<<<<<<< HEAD
        self.books: List[int] = [] # stores the book ids
        self.user_token: str = ""

    def __str__(self) -> str:
        '''
        String representation of a booklist object.
        Returns:
            str
        '''
        return f"{self.books}"
=======
        pass
>>>>>>> 9840dc9a1a55ece5064fa817f4209169f74dbbc6

    def add_book(self, book_id: int) -> None:
        '''
        Adds a book object to the list.
        Args:
            book: Book object to be added.
        '''
<<<<<<< HEAD
        if type(book_id) != int:
            raise TypeError("Book object should be given")

        self.books.append(book_id)
=======
        pass
>>>>>>> 9840dc9a1a55ece5064fa817f4209169f74dbbc6

    def remove_book_by_id(self, id: int) -> None:
        '''
        Removes a book from the list by id.
        Args:
            id: int
        '''

    def remove_book_by_object(self, book: Book) -> None:
        '''
        Removes a book from the list by a given book object.
        Args:
            book: Book
        '''

    def get_book_list(self) -> List[Book]:
        '''
        Returns the book list.
        Returns:
            list of books.
        '''

    def clear_book_list(self) -> None:
        '''
        Removes all books from the list.
        '''
