{
    init: function(elevators, floors) {
        const pick = set => {
            const picked = set.values().next().value;
            set.delete(picked);
            return picked;
        };
        const closest = (currentFloor, destinationFloors) =>
            destinationFloors.map(floor => [Math.abs(currentFloor - floor), floor]).sort()[0][1];

        const waitingFloors = new Set();
        const elevatorStates = new Map();
        elevators.forEach(elevator => {
            elevatorStates.set(elevator, {
                idle: true
            });
        });

        const callElevator = floorNum => () => {
            waitingFloors.add(floorNum);
            const elevator = elevators.find(elevator => elevatorStates.get(elevator).idle);
            if (elevator) {
                move(elevator)();
            }
        };
        const move = elevator => () => {
            const state = elevatorStates.get(elevator);
            const destinationFloors = elevator.getPressedFloors();
            const nextFloor = destinationFloors.length === 0 ? pick(waitingFloors) : closest(elevator.currentFloor, destinationFloors);
            if (nextFloor === undefined) {
                state.idle = true;
                return;
            }
            elevator.goToFloor(nextFloor);
            state.idle = false;
        };
        const stoppedAtFloor = floorNum => {
            waitingFloors.delete(floorNum);
        };
        const passingFloor = elevator => floorNum => {
            if (waitingFloors.has(floorNum)) {
                elevator.destinationQueue.unshift(floorNum);
                elevator.checkDestinationQueue();
            }
        };

        floors.forEach(floor => {
            floor.on("up_button_pressed", callElevator(floor.floorNum()));
            floor.on("down_button_pressed", callElevator(floor.floorNum()));
        });
        elevators.forEach(elevator => {
            elevator.on("passing_floor", passingFloor(elevator));
            elevator.on("stopped_at_floor", stoppedAtFloor);
            elevator.on("idle", move(elevator));
        })
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
