import unittest
from typing import List

# import sys
# sys.path.insert(1, 'backend')

from book_list import BookList

class tests(unittest.TestCase):

    def setUp(self) -> None:
        self.book_list = BookList()

    def test_create_class(self):
        '''
        Tests the creation of a BookList class.
        '''
        self.assertIsInstance(self.book_list, BookList)

        self.assertEqual(self.book_list.books, [])

        
    def test_clear_book_list(self):
        '''
            Tests the clear_book_list function of the BookList class.
        '''
        self.book_list.clear_book_list()
        self.assertEqual(self.book_list.books, [])

        self.book_list.add_book('5zl-KQEACAAJ')
        self.book_list.clear_book_list()
        self.assertEqual(self.book_list.books, [])

    def test_add_book_to_list(self):
        '''
        Tests the add_book function of the BookList class.
        '''
        self.book_list.clear_book_list()

        book = '5zl-KQEACAAJ'
        self.book_list.add_book(book)

        self.assertIsInstance(self.book_list.books, list)
        self.assertIsInstance(self.book_list.books[0], str)
        self.assertEqual(self.book_list.books, [book])

        self.assertRaises(TypeError, self.book_list.add_book, True)
        self.assertRaises(TypeError, self.book_list.add_book, 21)
        self.assertRaises(TypeError, self.book_list.add_book, None)

    def test_remove_book_by_index_from_list(self):
        '''
        Tests the remove_book_by_index function of the BookList class.
        '''
        self.book_list.clear_book_list()

        book = '5zl-KQEACAAJ'
        self.book_list.add_book(book)
        self.book_list.remove_book_by_index(0)
        self.assertEqual(self.book_list.books, [])

        self.assertRaises(ValueError, self.book_list.remove_book_by_index, 1)

        self.assertRaises(TypeError, self.book_list.remove_book_by_index, True)
        self.assertRaises(TypeError, self.book_list.remove_book_by_index, "book")
        self.assertRaises(TypeError, self.book_list.remove_book_by_index, None)



    def test_remove_book_by_id_from_list(self):
        '''
        Tests the remove_book_by_object function of the BookList class.
        '''
        self.book_list.clear_book_list()

        book = '5zl-KQEACAAJ'
        self.book_list.add_book(book)
        self.book_list.remove_book_by_id(book)
        self.assertEqual(self.book_list.books, [])

        self.assertRaises(ValueError, self.book_list.remove_book_by_id, book)

        self.assertRaises(TypeError, self.book_list.remove_book_by_id, False)
        self.assertRaises(TypeError, self.book_list.remove_book_by_id, 21)
        self.assertRaises(TypeError, self.book_list.remove_book_by_id, None)

    def test_get_book_list(self):
        '''
        Tests the get_book_list function of the BookList class.
        '''
        self.book_list.clear_book_list()

        current_books = self.book_list.get_book_list()
        self.assertEqual(current_books, [])
        
        book = '5zl-KQEACAAJ'
        self.book_list.add_book(book)
        current_books = self.book_list.get_book_list()
        self.assertIsInstance(self.book_list.books, List)
        self.assertIsInstance(self.book_list.books[0], str)
        self.assertEqual(current_books, [book])


    def test_get_book_by_index_from_list(self):
        '''
        Tests the get_book_by_id function of the BookList class.
        '''
        self.book_list.clear_book_list()

        book = '5zl-KQEACAAJ'
        self.book_list.add_book(book)
        self.assertEqual(self.book_list.get_book_by_index(0), book)

        self.book_list.remove_book_by_index(0)
        self.assertRaises(IndexError, self.book_list.get_book_by_index, 0)


    # def test_load_json_book_list(self):
    #     '''
    #     Tests the load_json function of the BookList class.
    #     '''
    #     self.book_list.clear_book_list()

    #     book = Book()
    #     self.book_list.add_book(book)

    #     json_books = {
    #         "user": "name",
    #         "books": [book]
    #     }


    # def test_get_json_book_list(self):
    #     '''
    #     Tests the get_json function of the BookList class.
    #     '''



if __name__ == "__main__":
    unittest.main