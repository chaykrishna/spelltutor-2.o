from spelltutor.core.play import Tutor
from termcolor import colored

def main():
    print("Welcome to SPELL TUTOR \n")
    user_name = input("Enter your name: ")
    age = input("Enter your age: ")
    _display_welcome_message(user_name)


def _display_welcome_message(user_name):
    number = _display_wc_message_and_get_number(user_name)
    play_message = Tutor(number).play()
    if play_message:
        print(play_message)
        number = _display_wc_message_and_get_number(user_name)
        play_message = Tutor(number).play()
        if play_message:
            print(play_message+"\n")
            print(colored("Choice has been entered incorrectly mulitple times restart the game and provide correct number to continue".upper(), "red", attrs=['underline','bold']))

def _display_wc_message_and_get_number(user_name):
    print(colored("Hi {},What would you like to learn? Choose from below and enter the number \n".format(user_name), "blue"))
    print("1. Spellings \n")
    print("2. Jumbled words \n")
    number = input("Enter your choice: ")
    return number


if __name__ == '__main__':
    main()