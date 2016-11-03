{
    init: function(elevators, floors) {
        const elevator = elevators[0]; // Let's use the first elevator
        const floorNums = floors.map(floor => floor.floorNum());

        // Whenever the elevator is idle (has no more queued destinations) ...
        elevator.on("idle", function() {
            floorNums.forEach(floorNum => {
                elevator.goToFloor(floorNum);
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
