function mergePracticalSlots(slots) {
    const mergedSlots = [];
    let i = 0;

    while (i < slots.length) {
        const currentSlot = slots[i];

        // Check if the current and next slots are consecutive practicals
        if (
            currentSlot.type === "practical" &&
            i + 1 < slots.length &&
            slots[i + 1].type === "practical" &&
            currentSlot.teacher._id === slots[i + 1].teacher._id &&
            currentSlot.subject._id === slots[i + 1].subject._id
        ) {
            // Merge the two practical slots
            const mergedSlot = {
                ...currentSlot,
            };
            mergedSlots.push(mergedSlot);

            // Skip the next slot since it's merged
            i += 2;
        } else {
            // Add non-practical or single slots as-is
            mergedSlots.push(currentSlot);
            i++;
        }
    }

    return mergedSlots;
}


export default mergePracticalSlots;