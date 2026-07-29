import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  SectionList,
  Pressable,
  SafeAreaView,
} from "react-native";

type Player = {
  id: number;
  name: string;
  role: string;
  country: string;
  runs: number;
  wickets: number;
};

type PlayerCardProps = {
  player: Player;
  isFavorite: boolean;
  onFavorite: () => void;
};


const players: Player[] = [
  {
    id: 1,
    name: "Babar Azam",
    role: "Batsman",
    country: "Pakistan",
    runs: 13000,
    wickets: 10,
  },
  {
    id: 2,
    name: "Virat Kohli",
    role: "Batsman",
    country: "India",
    runs: 26000,
    wickets: 4,
  },
  {
    id: 3,
    name: "Shaheen Afridi",
    role: "Bowler",
    country: "Pakistan",
    runs: 500,
    wickets: 300,
  },
  {
    id: 4,
    name: "Jasprit Bumrah",
    role: "Bowler",
    country: "India",
    runs: 400,
    wickets: 400,
  },
  {
    id: 5,
    name: "Ben Stokes",
    role: "All-Rounder",
    country: "England",
    runs: 12000,
    wickets: 300,
  },
  {
    id: 6,
    name: "Pat Cummins",
    role: "Bowler",
    country: "Australia",
    runs: 2500,
    wickets: 500,
  },
];


const PlayerCard = ({
  player,
  isFavorite,
  onFavorite,
}: PlayerCardProps) => {
  return (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {player.name}
        </Text>

        <Text style={styles.playerDetails}>
          {player.country} • {player.role}
        </Text>

        <Text style={styles.stats}>
          🏏 Runs: {player.runs}
        </Text>

        <Text style={styles.stats}>
          🎯 Wickets: {player.wickets}
        </Text>
      </View>

      <Pressable
        style={styles.favoriteButton}
        onPress={onFavorite}
      >
        <Text style={styles.favoriteText}>
          {isFavorite ? "❤️" : "🤍"}
        </Text>
      </Pressable>
    </View>
  );
};


export default function App() {


  const [search, setSearch] = useState("");

  const [filteredPlayers, setFilteredPlayers] =
    useState<Player[]>(players);

  const [favorites, setFavorites] =
    useState<number[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    console.log("Cricket IQ App Mounted");

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      console.log("Cricket IQ App Unmounted");
    };
  }, []);


  useEffect(() => {

    const result = players.filter((player) =>
      player.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredPlayers(result);

  }, [search]);


  const toggleFavorite = (playerId: number) => {

    if (favorites.includes(playerId)) {

      setFavorites(
        favorites.filter(
          (id) => id !== playerId
        )
      );

    } else {

      setFavorites([
        ...favorites,
        playerId,
      ]);

    }
  };


  const cricketCategories = [
    {
      title: "Batting",
      data: [
        "Highest Run Scorers",
        "Best Strike Rates",
        "Most Centuries",
      ],
    },
    {
      title: "Bowling",
      data: [
        "Highest Wicket Takers",
        "Best Economy Rates",
        "Most Five-Wicket Hauls",
      ],
    },
    {
      title: "Teams",
      data: [
        "Pakistan",
        "India",
        "Australia",
        "England",
      ],
    },
  ];


  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.logo}>
          🏏 Cricket IQ
        </Text>

        <Text style={styles.loadingText}>
          Loading cricket data...
        </Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>

      

      <View style={styles.header}>

        <Text style={styles.logo}>
          Cricket IQ
        </Text>

        <Text style={styles.subtitle}>
          Know the Game. Understand the Numbers.
        </Text>

      </View>

      {/* SEARCH */}

      <TextInput
        style={styles.searchInput}
        placeholder="Search players..."
        value={search}
        onChangeText={setSearch}
      />

      

      <Text style={styles.favoriteCount}>
        ⭐ Favorites: {favorites.length}
      </Text>

      

      <Text style={styles.sectionTitle}>
        Top Players
      </Text>

      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (

          <PlayerCard
            player={item}
            isFavorite={favorites.includes(item.id)}
            onFavorite={() =>
              toggleFavorite(item.id)
            }
          />

        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No players found.
          </Text>
        }
      />

      

      <Text style={styles.sectionTitle}>
        Explore Cricket
      </Text>

      <SectionList
        sections={cricketCategories}
        keyExtractor={(item, index) =>
          item + index
        }
        renderSectionHeader={({
          section: { title },
        }) => (

          <Text style={styles.categoryTitle}>
            {title}
          </Text>

        )}
        renderItem={({ item }) => (

          <View style={styles.categoryItem}>

            <Text>
              {item}
            </Text>

          </View>

        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  header: {
    marginBottom: 15,
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "gray",
  },

  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginBottom: 10,
  },

  favoriteCount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },

  playerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },

  playerInfo: {
    flex: 1,
  },

  playerName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  playerDetails: {
    marginTop: 5,
    color: "gray",
  },

  stats: {
    marginTop: 5,
    fontSize: 14,
  },

  favoriteButton: {
    padding: 10,
  },

  favoriteText: {
    fontSize: 25,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },

  categoryTitle: {
    fontSize: 17,
    fontWeight: "bold",
    backgroundColor: "#ddd",
    padding: 8,
    marginTop: 5,
  },

  categoryItem: {
    backgroundColor: "white",
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
  },

});