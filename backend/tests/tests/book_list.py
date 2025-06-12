from typing import List


class Book():
    '''
    Placeholder class for book.
    '''


class BookList():
    '''
    A super class for the favorites, read books, and want to read book lists.
    '''

    def __init__(self) -> None:
        '''
        Initializes a book_list object.
        '''
        pass

    def add_book(self, book: Book) -> None:
        '''
        Adds a book object to the list.
        Args:
            book: Book object to be added.
        '''
        pass

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
