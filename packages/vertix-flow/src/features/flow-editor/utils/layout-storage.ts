const FLOW_EDITOR_LAYOUT_KEY = "vertix.gg.flowEditorLayoutSizes";

// Function to save layout sizes to local storage
export const saveLayoutToLocalStorage = ( sizes: number[] ): void => {
  try {
    localStorage.setItem( FLOW_EDITOR_LAYOUT_KEY, JSON.stringify( sizes ) );
  } catch ( error ) {
    console.error( "[Layout] Error saving layout to local storage:", error );
  }
};

// Function to load layout sizes from local storage
export const loadLayoutFromLocalStorage = (): number[] | null => {
  try {
    const savedLayout = localStorage.getItem( FLOW_EDITOR_LAYOUT_KEY );
    if ( savedLayout ) {
      const parsedSizes = JSON.parse( savedLayout );
      // Basic validation
      if (
        Array.isArray( parsedSizes )
        && parsedSizes.length === 3
        && parsedSizes.every( ( s ) => typeof s === "number" && s > 0 && s < 100 )
        && parsedSizes.reduce( ( sum, s ) => sum + s, 0 ) === 100
      ) {
        return parsedSizes;
      }
      console.warn( "[Layout] Invalid layout data found in local storage.", parsedSizes );
      localStorage.removeItem( FLOW_EDITOR_LAYOUT_KEY ); // Clear invalid data
    }
  } catch ( error ) {
    console.error( "[Layout] Error loading layout from local storage:", error );
  }
  return null;
};
