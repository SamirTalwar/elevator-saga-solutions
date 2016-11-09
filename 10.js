{
    init: function(elevators, floors) {
        const up = 'up';
        const down = 'down';

        const sortByProximityTo = (currentFloor, destinationFloors) =>
            destinationFloors
                .map(floor => [Math.abs(currentFloor - floor), floor])
                .sort(([a, _], [b, __]) => a - b)
                .map(([_, floor]) => floor);

        const closest = (elevator, destinationFloors) => {
            const currentFloor = elevator.currentFloor();
            const floorsAbove = sortByProximityTo(currentFloor, destinationFloors.filter(floor => currentFloor < floor));
            const floorsBelow = sortByProximityTo(currentFloor, destinationFloors.filter(floor => currentFloor > floor));
            if (elevatorStates.get(elevator).direction === up) {
                return floorsAbove.concat(floorsBelow)[0];
            } else {
                return floorsBelow.concat(floorsAbove)[0];
            }
        };

        const pickClosest = (elevator, destinationFloors) => {
            const picked = closest(elevator, Array.from(destinationFloors.values()));
            destinationFloors.delete(picked);
            return picked;
        };

        const waitingFloors = new Set();
        const elevatorStates = new Map();
        elevators.forEach(elevator => {
            elevatorStates.set(elevator, {
                idle: true,
                direction: up,
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
            const nextFloor = destinationFloors.length === 0
            ? pickClosest(elevator, waitingFloors)
                : closest(elevator, destinationFloors);
            if (nextFloor === undefined) {
                state.idle = true;
                return;
            }
            elevator.goToFloor(nextFloor);
            state.idle = false;
            state.direction = elevator.currentFloor() < nextFloor ? up : down;
        };

        const stoppedAtFloor = floorNum => {
            waitingFloors.delete(floorNum);
        };

        const passingFloor = elevator => floorNum => {
            if (elevator.loadFactor < 0.9 && waitingFloors.has(floorNum) || elevator.getPressedFloors().indexOf(floorNum) >= 0) {
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
