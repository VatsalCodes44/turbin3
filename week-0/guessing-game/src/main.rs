use rand::Rng;
use std::{cmp::Ordering, io};

fn main() {
    println!("Welcome to the guessing game");

    let secret_num = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please Enter your guess");
        let mut input_str: String = String::new();
        io::stdin()
            .read_line(&mut input_str)
            .expect("Failed to read the input");

        println!("You guessed {input_str}");

        let guess = input_str.trim().parse::<i32>().expect("Number expected");

        match guess.cmp(&secret_num) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
