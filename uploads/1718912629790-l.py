def calculate_total_money(initial_investment, days):
    total_money = initial_investment
    for _ in range(days):
        total_money *= 1.01  # Increase by 1% daily
    return total_money

def main():
    try:
        initial_investment = float(input("Enter the initial amount of money invested: "))
        days = int(input("Enter the number of days: "))
        total_money = calculate_total_money(initial_investment, days)
        print(f"Total money after {days} days: {total_money:.2f}")
    except ValueError:
        print("Invalid input. Please enter numeric values for both inputs.")

if __name__ == "__main__":
    main()

