/**
 * Generates noise from a Laplace distribution.
 * @param scale The scale parameter (Sensitivity / Epsilon)
 */
function laplaceNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Calculates a differentially private average for a cohort's grades.
 * @param grades Array of true grade values
 * @param epsilon Privacy budget (lower = more private, more noise)
 * @param sensitivity Maximum possible change one student can make to the sum
 */
export function getDifferentiallyPrivateAverage(grades: number[], epsilon: number = 1.0): number {
    if (grades.length === 0) return 0;

    const trueSum = grades.reduce((acc, val) => acc + val, 0);
    const trueCount = grades.length;
    
    // Sensitivity for grades (assuming max grade is 100)
    const sensitivity = 100; 
    const scale = sensitivity / epsilon;

    // Inject Laplace noise into the sum
    const noisySum = trueSum + laplaceNoise(scale);
    
    // Calculate the noisy average, clamped between 0 and 100
    let noisyAverage = noisySum / trueCount;
    noisyAverage = Math.max(0, Math.min(100, noisyAverage));

    return Number(noisyAverage.toFixed(2));
}