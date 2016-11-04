{
    init: function(elevators, floors) {
        const pick = set => {
            const picked = set.values().next().value;
            set.delete(picked);
            return picked;
        };

        const waitingFloors = new Set();
        const elevatorStates = new Map();
        elevators.forEach(elevator => {
            elevatorStates.set(elevator, {
                idle: true,
                destinationFloors: new Set()
            });
        });

        const callElevator = floorNum => () => {
            waitingFloors.add(floorNum);
            const elevator = elevators.find(elevator => elevatorStates.get(elevator).idle);
            if (elevator) {
                move(elevator);
            }
        };
        const move = elevator => {
            const state = elevatorStates.get(elevator)
            const destinationFloors = elevatorStates.get(elevator).destinationFloors;
            if (destinationFloors.size === 0 && waitingFloors.size === 0) {
                state.idle = true;
                return;
            }
            const nextFloor = destinationFloors.size === 0 ? pick(waitingFloors) : pick(destinationFloors);
            elevator.goToFloor(nextFloor);
            state.idle = false;
        };

        floors.forEach(floor => {
            floor.on("up_button_pressed", callElevator(floor.floorNum()));
            floor.on("down_button_pressed", callElevator(floor.floorNum()));
        });
        elevators.forEach(elevator => {
            elevator.on("floor_button_pressed", floorNum => {
                elevatorStates.get(elevator).destinationFloors.add(floorNum);
            });
            elevator.on("idle", () => move(elevator));
        })
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
