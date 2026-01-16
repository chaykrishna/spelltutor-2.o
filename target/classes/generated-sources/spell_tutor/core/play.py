import random
from spelltutor.utils.prop_reader import PropertyUtil
from termcolor import colored

class Tutor:

    def __init__(self, inp_choice):
        self._inp_choice = inp_choice
        self._jumble_answer_map = None
    
    def play(self):
        sub_game = self._get_sub_game()
        if sub_game == "letter_to_spellings":
            self._letter_to_spellings(sub_game)
        elif sub_game == "jumbled_words":
            self._jumbled_words(sub_game)
        else:
            return sub_game

    def _letter_to_spellings(self, sub_game):
        while True:
            inp_letter = input("Enter a letter: ")
            if not inp_letter:
                exit_word = input("Enter 'Bye' to exit: ")
                if exit_word.lower() == "bye":
                    break
            else:
                word = self._get_word_from_prop(sub_game, inp_letter)
                print("{} \n".format(word))
    
    def _jumbled_words(self, sub_game):
        while True:
            print("Identify the correct word from the below jumbled word \n")
            jumbled_word = self._get_jumbled_word_from_prop(sub_game)
            print(f"Jumbled Word: '''{jumbled_word}''' \n")
            user_answer = input("Enter the correct word: ")
            if not user_answer:
                exit_word = input("Enter 'Bye' to exit: ")
                if exit_word.lower() == "bye":
                    break
            self._set_jumbled_answer_map(sub_game)
            original_answer = self._jumble_answer_map.get(jumbled_word)
            if user_answer == original_answer:
                print("Well Done! Your answer is correct \n")
            else:
                print(f"Entered answer {user_answer} is incorrect. \n")

    
    def _get_sub_game(self):
        try:
            if int(self._inp_choice) == 1:
                return "letter_to_spellings"
            elif int(self._inp_choice) == 2:
                return "jumbled_words"
            else:
                return f"Entered number {self._inp_choice} is in-correct, Enter correct number"
        except ValueError:
            print(colored("Entered Value is wrong!!", "red"))

    def _get_word_from_prop(self, sub_game, inp_letter):
        #print("Prop file is : {}".format(sub_game))
        words = PropertyUtil(r"{}.properties".format(sub_game), "spellingssection").get_value_for_key(inp_letter)
        words_list = words.split(",")
        return random.choice(words_list)

    def _get_jumbled_word_from_prop(self, sub_game, diff_level="easy"):
        jumbled_words = PropertyUtil(r"{}.properties".format(sub_game), "jumbledsection").get_value_for_key(diff_level)
        jumbled_list = jumbled_words.split(",")
        return random.choice(jumbled_list)
    
    def _set_jumbled_answer_map(self, sub_game, diff_level="easy_answers"):
        jumbled_words = PropertyUtil(r"{}.properties".format(sub_game), "jumbledsection").get_value_for_key(diff_level.rstrip("_answers"))
        answers = PropertyUtil(r"{}.properties".format(sub_game), "jumbledsection").get_value_for_key(diff_level)
        print(f"Jumbled words : {jumbled_words}, answers has: {answers}")
        self._jumble_answer_map = dict(zip(jumbled_words.split(","), answers.split(",")))