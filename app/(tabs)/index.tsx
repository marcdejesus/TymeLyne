import * as React from "react";
import {ScrollView, Text, StyleSheet, View, Image} from "react-native";

const Current = () => {
  	
  	return (
    		<ScrollView style={styles.current}>
      			<View style={[styles.button, styles.buttonFlexBox]}>
        				<Text style={[styles.label, styles.labelTypo]}>Completed</Text>
      			</View>
      			<View style={[styles.button1, styles.buttonFlexBox]}>
        				<Text style={[styles.label1, styles.labelTypo]}>Current</Text>
      			</View>
      			<View style={[styles.button2, styles.buttonFlexBox]}>
        				<Text style={[styles.label, styles.labelTypo]}>Add New</Text>
      			</View>
      			<View style={[styles.statsCard, styles.menuBorder]}>
						<Image style={styles.clockIcon} resizeMode="cover" source={require('@/assets/images/clock.svg')} />
        				<View style={styles.reviewBody}>
          					<View style={styles.textHeading}>
            						<Text style={styles.textHeading1}>13</Text>
          					</View>
          					<View style={styles.textHeading}>
            						<Text style={[styles.text1, styles.text1Layout]}>Day Streak!</Text>
          					</View>
        				</View>
      			</View>
      			<View style={[styles.menu, styles.menuBorder]}>
        				<View style={styles.menuHeader}>
          					<Text style={[styles.heading, styles.labelTypo]}>Heading</Text>
          					<Text style={[styles.heading1, styles.text1Layout]}>Heading</Text>
        				</View>
        				<View style={styles.menuFlexBox}>
          					<View style={styles.rule} />
        				</View>
        				<View style={styles.menuSection}>
          					<View style={[styles.menuItem, styles.menuItemSpaceBlock]}>
            						<Image style={styles.squareIcon} resizeMode="cover" source={require('@/assets/images/star.svg')} />
            						<View style={styles.body}>
              							<View style={styles.row}>
                								<Text style={[styles.label3, styles.text1Layout]}>Menu Label</Text>
              							</View>
              							<Text style={[styles.heading, styles.labelTypo]}>Menu description.</Text>
            						</View>
          					</View>
          					<View style={[styles.menuItem1, styles.menuItemSpaceBlock]}>
            						<Image style={styles.squareIcon} resizeMode="cover" source={require('@/assets/images/star.svg')} />
            						<View style={styles.body}>
              							<View style={styles.row}>
                								<Text style={[styles.label3, styles.text1Layout]}>Menu Label</Text>
              							</View>
              							<Text style={[styles.heading, styles.labelTypo]}>Menu description.</Text>
            						</View>
          					</View>
          					<View style={[styles.menuItem1, styles.menuItemSpaceBlock]}>
            						<Image style={styles.squareIcon} resizeMode="cover" source={require('@/assets/images/star.svg')} />
            						<View style={styles.body}>
              							<View style={styles.row}>
                								<Text style={[styles.label3, styles.text1Layout]}>Menu Label</Text>
              							</View>
              							<Text style={[styles.heading, styles.labelTypo]}>Menu description.</Text>
            						</View>
          					</View>
        				</View>
        				<View style={[styles.menuSeparator1, styles.menuFlexBox]}>
          					<View style={styles.rule} />
        				</View>
        				<View style={styles.menuSection1}>
          					<View style={[styles.menuItem1, styles.menuItemSpaceBlock]}>
            						<Image style={styles.squareIcon} resizeMode="cover" source={require('@/assets/images/star.svg')} />
            						<View style={styles.body}>
              							<View style={styles.row}>
                								<Text style={[styles.label3, styles.text1Layout]}>Menu Label</Text>
              							</View>
              							<Text style={[styles.heading, styles.labelTypo]}>Menu description.</Text>
            						</View>
          					</View>
          					<View style={[styles.menuItem, styles.menuItemSpaceBlock]}>
            						<Image style={styles.squareIcon} resizeMode="cover" source={require('@/assets/images/star.svg')} />
            						<View style={styles.body}>
              							<View style={styles.row}>
                								<Text style={[styles.label3, styles.text1Layout]}>Menu Label</Text>
              							</View>
              							<Text style={[styles.heading, styles.labelTypo]}>Menu description.</Text>
            						</View>
          					</View>
        				</View>
      			</View>
    		</ScrollView>);
};

const styles = StyleSheet.create({
  	buttonFlexBox: {
    		paddingVertical: 4,
    		paddingHorizontal: 10,
    		borderRadius: 40,
    		top: 9,
    		position: "absolute",
    		justifyContent: "center",
    		alignItems: "center",
    		flexDirection: "row"
  	},
  	labelTypo: {
    		textAlign: "left",
    		fontFamily: "Inter-Regular"
  	},
  	menuBorder: {
    		width: 390,
    		borderWidth: 1,
    		borderColor: "#d9d9d9",
    		borderStyle: "solid",
    		left: 17,
    		borderRadius: 8,
    		position: "absolute",
    		backgroundColor: "#fff"
  	},
  	text1Layout: {
    		lineHeight: 22,
    		fontSize: 16,
    		color: "#1e1e1e"
  	},
  	menuItemSpaceBlock: {
    		gap: 12,
    		paddingVertical: 12,
    		borderRadius: 12,
    		paddingHorizontal: 16,
    		overflow: "hidden",
    		flexDirection: "row"
  	},
  	menuFlexBox: {
    		paddingVertical: 8,
    		paddingHorizontal: 16,
    		alignSelf: "stretch",
    		justifyContent: "center",
    		alignItems: "center"
  	},
  	label: {
    		color: "#000",
    		lineHeight: 20,
    		letterSpacing: 0,
    		fontSize: 15,
    		textAlign: "left"
  	},
  	button: {
    		left: 98,
    		backgroundColor: "#c7c7cc",
    		paddingVertical: 4,
    		paddingHorizontal: 10,
    		borderRadius: 40,
    		top: 9,
    		position: "absolute"
  	},
  	label1: {
    		color: "#fff",
    		lineHeight: 20,
    		letterSpacing: 0,
    		fontSize: 15,
    		textAlign: "left"
  	},
  	button1: {
    		left: 18,
    		backgroundColor: "#000",
    		paddingVertical: 4,
    		paddingHorizontal: 10,
    		borderRadius: 40,
    		top: 9,
    		position: "absolute"
  	},
  	button2: {
    		left: 202,
    		backgroundColor: "#c7c7cc",
    		paddingVertical: 4,
    		paddingHorizontal: 10,
    		borderRadius: 40,
    		top: 9,
    		position: "absolute"
  	},
  	clockIcon: {
    		width: 40,
    		height: 40,
    		overflow: "hidden"
  	},
  	textHeading1: {
    		fontSize: 24,
    		letterSpacing: -0.5,
    		lineHeight: 29,
    		textAlign: "center",
    		color: "#1e1e1e",
    		fontFamily: "Inter-SemiBold",
    		fontWeight: "600"
  	},
  	textHeading: {
    		alignSelf: "stretch",
    		justifyContent: "center",
    		flexDirection: "row"
  	},
  	text1: {
    		textAlign: "center",
    		fontFamily: "Inter-Regular",
    		fontSize: 16
  	},
  	reviewBody: {
    		gap: 4,
    		alignSelf: "stretch",
    		alignItems: "center"
  	},
  	statsCard: {
    		top: 47,
    		height: 171,
    		padding: 24,
    		gap: 24,
    		minWidth: 240,
    		alignItems: "center"
  	},
  	heading: {
    		fontSize: 14,
    		lineHeight: 20,
    		color: "#757575",
    		alignSelf: "stretch"
  	},
  	heading1: {
    		fontFamily: "Inter-SemiBold",
    		fontWeight: "600",
    		fontSize: 16,
    		alignSelf: "stretch",
    		textAlign: "left"
  	},
  	menuHeader: {
    		paddingTop: 8,
    		paddingBottom: 4,
    		paddingHorizontal: 16,
    		alignSelf: "stretch",
    		overflow: "hidden"
  	},
  	rule: {
    		backgroundColor: "#d9d9d9",
    		height: 1,
    		alignSelf: "stretch"
  	},
  	squareIcon: {
    		width: 20,
    		height: 20,
    		overflow: "hidden"
  	},
  	label3: {
    		textAlign: "left",
    		fontFamily: "Inter-Regular",
    		flex: 1
  	},
  	row: {
    		justifyContent: "space-between",
    		alignSelf: "stretch",
    		alignItems: "center",
    		flexDirection: "row"
  	},
  	body: {
    		gap: 4,
    		flex: 1
  	},
  	menuItem: {
    		width: 285
  	},
  	menuItem1: {
    		alignSelf: "stretch"
  	},
  	menuSection: {
    		alignSelf: "stretch",
    		overflow: "hidden",
    		borderRadius: 8
  	},
  	menuSeparator1: {
    		borderRadius: 8
  	},
  	menuSection1: {
    		alignSelf: "stretch"
  	},
  	menu: {
    		top: 234,
    		shadowColor: "rgba(12, 12, 13, 0.1)",
    		shadowOffset: {
      			width: 0,
      			height: 4
    		},
    		shadowRadius: 4,
    		elevation: 4,
    		shadowOpacity: 1,
    		height: 452,
    		padding: 8,
    		overflow: "hidden"
  	},
  	current: {
    		width: "100%",
    		maxWidth: "100%",
    		flex: 1,
    		backgroundColor: "#fff"
  	}
});

export default Current;
