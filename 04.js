{
    init: function(elevators, floors) {
        const pick = set => {
            const picked = set.values().next().value;
            set.delete(picked);
            return picked;
        };

        const waitingFloors = new Set();
        const destinationFloors = new Map();
        const callElevator = floorNum => () => {
            waitingFloors.add(floorNum);
            elevators.forEach(move);
        };
        const move = elevator => () => {
            const elevatorDestinationFloors = destinationFloors.get(elevator) || new Set();
            if (elevatorDestinationFloors.size === 0 && waitingFloors.size === 0) {
                return;
            }
            const nextFloor = elevatorDestinationFloors.size === 0 ? pick(waitingFloors) : pick(elevatorDestinationFloors);
            elevator.goToFloor(nextFloor);
        };

        floors.forEach(floor => {
            floor.on("up_button_pressed", callElevator(floor.floorNum()));
            floor.on("down_button_pressed", callElevator(floor.floorNum()));
        });
        elevators.forEach(elevator => {
            elevator.on("stopped_at_floor", floorNum => {
                move(elevator)();
            });
            elevator.on("floor_button_pressed", floorNum => {
                const elevatorDestinationFloors = destinationFloors.get(elevator) || new Set();
                elevatorDestinationFloors.add(floorNum);
                destinationFloors.set(elevator, elevatorDestinationFloors);
                move(elevator)();
            });
            elevator.on("idle", move(elevator));
        })
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
